import { execSync } from 'node:child_process'

const container = process.env.JOBFLOW_TEST_DB_CONTAINER ?? 'jobflow-test-postgres'
const user = process.env.JOBFLOW_TEST_DB_USER ?? 'jobflow'
const dbName = process.env.JOBFLOW_TEST_DB_NAME ?? 'jobflow_test'

for (let attempt = 1; attempt <= 30; attempt += 1) {
  try {
    execSync(`docker exec ${container} pg_isready -U ${user} -d ${dbName}`, { stdio: 'inherit' })
    console.log(`test db is ready on attempt ${attempt}`)
    process.exit(0)
  }
  catch {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000)
  }
}

console.error('test db did not become ready in time')
process.exit(1)
