import { createRequire } from 'node:module'

const databaseUrl = process.env.JOBFLOW_DATABASE_URL?.trim()
if (!databaseUrl) {
  console.error('JOBFLOW_DATABASE_URL is required for db:check:migrations-seed')
  process.exit(1)
}

const require = createRequire(import.meta.url)
const { Pool } = require('pg')
const pool = new Pool({ connectionString: databaseUrl })

try {
  const checks = [
    ['vacancies', 'SELECT count(*)::int AS count FROM vacancies'],
    ['pipeline_events', 'SELECT count(*)::int AS count FROM pipeline_events'],
    ['interviews', 'SELECT count(*)::int AS count FROM interviews'],
    ['offers', 'SELECT count(*)::int AS count FROM offers'],
  ]

  for (const [name, query] of checks) {
    const result = await pool.query(query)
    const count = result.rows[0]?.count ?? 0
    if (count <= 0) {
      throw new Error(`Expected ${name} to contain data after seed`)
    }
  }

  console.log('postgres migration/seed smoke check passed')
}
finally {
  await pool.end()
}
