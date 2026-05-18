import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const seedProfiles = {
  dev: '0001_dev_seed.sql',
  e2e: '0002_e2e_seed.sql',
  perf: '0003_perf_seed.sql',
}

const profile = (process.env.JOBFLOW_DB_SEED_PROFILE ?? 'dev').trim()
const file = seedProfiles[profile]
const databaseUrl = process.env.JOBFLOW_DATABASE_URL?.trim()

if (!databaseUrl) {
  console.error('JOBFLOW_DATABASE_URL is required for db:seed')
  process.exit(1)
}

if (!file) {
  console.error(`Unsupported JOBFLOW_DB_SEED_PROFILE: ${profile}`)
  console.error(`Supported profiles: ${Object.keys(seedProfiles).join(', ')}`)
  process.exit(1)
}

const seedPath = join(process.cwd(), 'db', 'seeds', file)

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
  console.log(`seed applied: ${file} (profile: ${profile})`)
}
finally {
  await pool.end()
}
