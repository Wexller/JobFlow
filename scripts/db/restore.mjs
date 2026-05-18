import { spawnSync } from 'node:child_process'
import { basename } from 'node:path'

const container = process.env.JOBFLOW_TEST_DB_CONTAINER ?? 'jobflow-test-postgres'
const user = process.env.JOBFLOW_TEST_DB_USER ?? 'jobflow'
const dbName = process.env.JOBFLOW_TEST_DB_NAME ?? 'jobflow_test'
const backupPath = process.env.JOBFLOW_DB_BACKUP_PATH?.trim()
const force = process.env.JOBFLOW_DB_RESTORE_FORCE === 'true'

if (!backupPath) {
  console.error('JOBFLOW_DB_BACKUP_PATH is required for db:restore')
  process.exit(1)
}

if (!force) {
  console.error('Refusing destructive restore without JOBFLOW_DB_RESTORE_FORCE=true')
  process.exit(1)
}

const backupFileName = basename(backupPath)

const copy = spawnSync('docker', ['cp', backupPath, `${container}:/tmp/${backupFileName}`], { stdio: 'inherit' })
if (copy.status !== 0) process.exit(copy.status ?? 1)

const restore = spawnSync(
  'docker',
  ['exec', container, 'pg_restore', '-U', user, '-d', dbName, '--clean', '--if-exists', '--no-owner', '--no-privileges', `/tmp/${backupFileName}`],
  { stdio: 'inherit' },
)
if (restore.status !== 0) process.exit(restore.status ?? 1)

spawnSync('docker', ['exec', container, 'rm', '-f', `/tmp/${backupFileName}`], { stdio: 'inherit' })
console.log(`restore completed from: ${backupPath}`)
