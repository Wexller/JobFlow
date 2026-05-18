import { createRequire } from 'node:module'

const databaseUrl = process.env.JOBFLOW_DATABASE_URL?.trim()
if (!databaseUrl) {
  console.error('JOBFLOW_DATABASE_URL is required for db:check:repository')
  process.exit(1)
}

const require = createRequire(import.meta.url)
const { Pool } = require('pg')
const pool = new Pool({ connectionString: databaseUrl })

try {
  const snapshot = await pool.query('SELECT count(*)::int AS count FROM vacancies')
  if ((snapshot.rows[0]?.count ?? 0) <= 0) {
    throw new Error('snapshot check failed: vacancies table is empty')
  }

  await pool.query('BEGIN')
  try {
    await pool.query(
      `INSERT INTO vacancies (id, company, role, status, priority, format, tech_stack, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      ['vacancy-postgres-created', 'DB Co', 'Backend Engineer', 'applied', 'high', 'remote', ['TypeScript', 'Postgres'], '2026-05-18T10:00:00Z', '2026-05-18T10:00:00Z'],
    )

    await pool.query(
      'UPDATE vacancies SET priority = $1, updated_at = $2 WHERE id = $3',
      ['urgent', '2026-05-18T11:00:00Z', 'vacancy-postgres-created'],
    )

    const updated = await pool.query('SELECT priority FROM vacancies WHERE id = $1', ['vacancy-postgres-created'])
    if (updated.rows[0]?.priority !== 'urgent') {
      throw new Error('update check failed: priority was not updated')
    }

    const mismatch = await pool.query(
      'SELECT vacancy_id FROM pipeline_events WHERE id = $1',
      ['pipeline-crm-screen'],
    )
    if (mismatch.rows[0]?.vacancy_id === 'vacancy-design-systems') {
      throw new Error('fixture check failed: expected pipeline-crm-screen to belong to another vacancy')
    }

    await pool.query('ROLLBACK')
  }
  catch (error) {
    await pool.query('ROLLBACK')
    throw error
  }

  console.log('postgres repository behavior check passed')
}
finally {
  await pool.end()
}
