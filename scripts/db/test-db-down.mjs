import { execSync } from 'node:child_process'

const container = process.env.JOBFLOW_TEST_DB_CONTAINER ?? 'jobflow-test-postgres'

try {
  execSync(`docker rm -f ${container}`, { stdio: 'inherit' })
}
catch {
  console.log('test db container is not running')
}
