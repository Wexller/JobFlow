const user = process.env.JOBFLOW_TEST_DB_USER ?? 'jobflow'
const password = process.env.JOBFLOW_TEST_DB_PASSWORD ?? 'jobflow'
const dbName = process.env.JOBFLOW_TEST_DB_NAME ?? 'jobflow_test'
const port = process.env.JOBFLOW_TEST_DB_PORT ?? '55432'

process.stdout.write(`postgres://${user}:${password}@127.0.0.1:${port}/${dbName}`)
