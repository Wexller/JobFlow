import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const seedPath = join(process.cwd(), 'db', 'seeds', '0001_dev_seed.sql')
const databaseUrl = process.env.JOBFLOW_DATABASE_URL?.trim()

if (!databaseUrl) {
  console.error('JOBFLOW_DATABASE_URL is required for db:seed')
  process.exit(1)
}

let pgModule
try {
  pgModule = await import('pg')
}
catch {
  console.error('The "pg" package is required for db:seed. Install it before running this command.')
  process.exit(1)
}

const { Pool } = pgModule
const pool = new Pool({ connectionString: databaseUrl })

try {
  const sql = await readFile(seedPath, 'utf8')
  await pool.query(sql)
  console.log('seed applied: 0001_dev_seed.sql')
}
finally {
  await pool.end()
}
