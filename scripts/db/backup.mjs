import { execSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const container = process.env.JOBFLOW_TEST_DB_CONTAINER ?? 'jobflow-test-postgres'
const user = process.env.JOBFLOW_TEST_DB_USER ?? 'jobflow'
const dbName = process.env.JOBFLOW_TEST_DB_NAME ?? 'jobflow_test'
const backupDir = process.env.JOBFLOW_DB_BACKUP_DIR ?? join(process.cwd(), 'db', 'backups')
const backupName = process.env.JOBFLOW_DB_BACKUP_NAME ?? `jobflow-${new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')}.dump`
const outputPath = join(backupDir, backupName)

mkdirSync(backupDir, { recursive: true })

execSync(
  `docker exec ${container} pg_dump -U ${user} -d ${dbName} -Fc -f /tmp/${backupName}`,
  { stdio: 'inherit' },
)
execSync(`docker cp ${container}:/tmp/${backupName} ${outputPath}`, { stdio: 'inherit' })
execSync(`docker exec ${container} rm -f /tmp/${backupName}`, { stdio: 'inherit' })

console.log(`backup saved: ${outputPath}`)
