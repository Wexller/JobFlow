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

try {
  const files = (await readdir(migrationsDir)).filter((file) => file.endsWith('.sql')).sort()

  for (const file of files) {
    const sql = await readFile(join(migrationsDir, file), 'utf8')
    await pool.query(sql)
    console.log(`applied migration: ${file}`)
  }
}
finally {
  await pool.end()
}
