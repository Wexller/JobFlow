/**
 * @vitest-environment node
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'
import { createRequire } from 'node:module'

const testDatabaseUrl = process.env.JOBFLOW_DATABASE_URL?.trim()
const dockerAvailable = (() => {
  try {
    execSync('docker info', { stdio: 'ignore' })
    return true
  }
  catch {
    return false
  }
})()

const runSmoke = testDatabaseUrl !== undefined && testDatabaseUrl.length > 0 && dockerAvailable
const maybeDescribe = runSmoke ? describe : describe.skip

function run(command: string) {
  execSync(command, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      JOBFLOW_DATABASE_URL: testDatabaseUrl,
    },
    stdio: 'inherit',
  })
}

maybeDescribe('postgres migrations and seed smoke', () => {
  const managesDbLifecycle = process.env.JOBFLOW_TEST_MANAGE_DB !== 'false'

  beforeAll(() => {
    if (managesDbLifecycle) {
      run('pnpm -s db:test:up')
    }
  })

  afterAll(() => {
    if (managesDbLifecycle) {
      run('pnpm -s db:test:down')
    }
  })

  it('applies migrations and seed on isolated postgres instance', async () => {
    run('pnpm -s db:migrate')
    run('pnpm -s db:seed')

    const require = createRequire(import.meta.url)
    const { Pool } = require('pg') as {
      Pool: new (options: { connectionString: string | undefined }) => {
        query: (text: string) => Promise<{ rows: Array<{ count: number }> }>
        end: () => Promise<void>
      }
    }
    const pool = new Pool({ connectionString: testDatabaseUrl })

    try {
      const vacancies = await pool.query('SELECT count(*)::int AS count FROM vacancies')
      const pipelineEvents = await pool.query('SELECT count(*)::int AS count FROM pipeline_events')
      const interviews = await pool.query('SELECT count(*)::int AS count FROM interviews')
      const offers = await pool.query('SELECT count(*)::int AS count FROM offers')

      expect(vacancies.rows[0]?.count).toBeGreaterThan(0)
      expect(pipelineEvents.rows[0]?.count).toBeGreaterThan(0)
      expect(interviews.rows[0]?.count).toBeGreaterThan(0)
      expect(offers.rows[0]?.count).toBeGreaterThan(0)
    }
    finally {
      await pool.end()
    }
  })
})
