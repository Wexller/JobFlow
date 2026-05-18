import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const migrationsDir = join(process.cwd(), 'db', 'migrations')
const databaseUrl = process.env.JOBFLOW_DATABASE_URL?.trim()

if (!databaseUrl) {
  console.error('JOBFLOW_DATABASE_URL is required for db:migrate')
  process.exit(1)
}

let pgModule
try {
  pgModule = await import('pg')
}
catch {
  console.error('The "pg" package is required for db:migrate. Install it before running this command.')
  process.exit(1)
}

const { Pool } = pgModule
const pool = new Pool({ connectionString: databaseUrl })

const bootstrapSql = `
CREATE TABLE IF NOT EXISTS schema_migrations (
  name TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`

try {
  await pool.query(bootstrapSql)
  const files = (await readdir(migrationsDir)).filter((file) => file.endsWith('.sql')).sort()

  for (const file of files) {
    const alreadyApplied = await pool.query(
      'SELECT 1 FROM schema_migrations WHERE name = $1 LIMIT 1',
      [file],
    )

    if (alreadyApplied.rowCount && alreadyApplied.rowCount > 0) {
      console.log(`skipped migration: ${file}`)
      continue
    }

    const sql = await readFile(join(migrationsDir, file), 'utf8')
    await pool.query('BEGIN')
    try {
      await pool.query(sql)
      await pool.query(
        'INSERT INTO schema_migrations (name) VALUES ($1)',
        [file],
      )
      await pool.query('COMMIT')
    }
    catch (error) {
      await pool.query('ROLLBACK')
      throw error
    }

    console.log(`applied migration: ${file}`)
  }
}
finally {
  await pool.end()
}
