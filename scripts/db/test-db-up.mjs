import { execSync } from 'node:child_process'

const container = process.env.JOBFLOW_TEST_DB_CONTAINER ?? 'jobflow-test-postgres'
const user = process.env.JOBFLOW_TEST_DB_USER ?? 'jobflow'
const password = process.env.JOBFLOW_TEST_DB_PASSWORD ?? 'jobflow'
const dbName = process.env.JOBFLOW_TEST_DB_NAME ?? 'jobflow_test'
const port = process.env.JOBFLOW_TEST_DB_PORT ?? '55432'

function run(command) {
  execSync(command, { stdio: 'inherit' })
}

try {
  run(`docker rm -f ${container}`)
}
catch {
  // noop
}

run([
  'docker run -d',
  `--name ${container}`,
  `-e POSTGRES_USER=${user}`,
  `-e POSTGRES_PASSWORD=${password}`,
  `-e POSTGRES_DB=${dbName}`,
  `-p ${port}:5432`,
  'postgres:16-alpine',
].join(' '))

for (let attempt = 1; attempt <= 30; attempt += 1) {
  try {
    run(`docker exec ${container} pg_isready -U ${user} -d ${dbName}`)
    console.log(`test db is ready on attempt ${attempt}`)
    process.exit(0)
  }
  catch {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000)
  }
}

console.error('test db did not become ready in time')
process.exit(1)
