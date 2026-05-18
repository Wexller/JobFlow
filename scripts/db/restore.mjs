import { execSync } from 'node:child_process'
import { basename } from 'node:path'

const container = process.env.JOBFLOW_TEST_DB_CONTAINER ?? 'jobflow-test-postgres'
const user = process.env.JOBFLOW_TEST_DB_USER ?? 'jobflow'
const dbName = process.env.JOBFLOW_TEST_DB_NAME ?? 'jobflow_test'
const backupPath = process.env.JOBFLOW_DB_BACKUP_PATH?.trim()

if (!backupPath) {
  console.error('JOBFLOW_DB_BACKUP_PATH is required for db:restore')
  process.exit(1)
}

const backupFileName = basename(backupPath)

execSync(`docker cp ${backupPath} ${container}:/tmp/${backupFileName}`, { stdio: 'inherit' })
execSync(
  `docker exec ${container} pg_restore -U ${user} -d ${dbName} --clean --if-exists --no-owner --no-privileges /tmp/${backupFileName}`,
  { stdio: 'inherit' },
)
execSync(`docker exec ${container} rm -f /tmp/${backupFileName}`, { stdio: 'inherit' })

console.log(`restore completed from: ${backupPath}`)
