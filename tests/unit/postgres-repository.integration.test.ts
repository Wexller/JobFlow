/**
 * @vitest-environment node
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { createPostgresJobflowRepository } from '../../server/repositories/postgresJobflowRepository'
import type { SqlClient } from '../../server/repositories/postgres/sqlClient'

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
const hasDatabaseUrl = testDatabaseUrl !== undefined && testDatabaseUrl.length > 0
const runIntegration = hasDatabaseUrl && dockerAvailable

const maybeDescribe = runIntegration ? describe : describe.skip

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

function createClientFactory(): () => Promise<SqlClient> {
  return async () => {
    const require = createRequire(import.meta.url)
    const { Pool } = require('pg') as {
      Pool: new (options: { connectionString: string | undefined }) => {
        query: SqlClient['query']
        end: SqlClient['end']
      }
    }
    const pool = new Pool({ connectionString: testDatabaseUrl })

    return {
      end: async () => {
        await pool.end()
      },
      query: (text, params) => pool.query(text, params),
    }
  }
}

maybeDescribe('postgres repository integration', () => {
  const repository = createPostgresJobflowRepository(createClientFactory())
  const managesDbLifecycle = process.env.JOBFLOW_TEST_MANAGE_DB !== 'false'

  beforeAll(() => {
    if (managesDbLifecycle) {
      run('pnpm -s db:test:up')
    }
    run('pnpm -s db:migrate')
  })

  beforeEach(() => {
    run('pnpm -s db:seed')
  })

  afterAll(() => {
    if (managesDbLifecycle) {
      run('pnpm -s db:test:down')
    }
  })

  it('loads snapshot from postgres with expected relations', async () => {
    const result = await repository.getSnapshot()

    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }

    expect(result.value.vacancies.length).toBeGreaterThan(0)
    expect(result.value.pipelineEvents.length).toBeGreaterThan(0)
    expect(result.value.interviews.length).toBeGreaterThan(0)
    expect(result.value.offers.length).toBeGreaterThan(0)
  })

  it('creates and updates vacancy through postgres adapter', async () => {
    const createResult = await repository.createVacancy({
      id: 'vacancy-postgres-created',
      company: 'DB Co',
      role: 'Backend Engineer',
      status: 'applied',
      priority: 'high',
      format: 'remote',
      techStack: ['TypeScript', 'Postgres'],
      createdAt: '2026-05-18T10:00:00Z',
      updatedAt: '2026-05-18T10:00:00Z',
    })

    expect(createResult.ok).toBe(true)
    if (!createResult.ok) {
      return
    }

    const updateResult = await repository.updateVacancy(createResult.value.id, {
      ...createResult.value,
      priority: 'urgent',
      updatedAt: '2026-05-18T11:00:00Z',
    })

    expect(updateResult).toMatchObject({
      ok: true,
      value: {
        id: 'vacancy-postgres-created',
        priority: 'urgent',
      },
    })
  })

  it('rejects interview whose pipeline event belongs to another vacancy', async () => {
    const result = await repository.createInterview({
      id: 'interview-invalid-link-db',
      vacancyId: 'vacancy-design-systems',
      pipelineEventId: 'pipeline-crm-screen',
      stage: 'recruiter_screen',
      scheduledAt: '2026-05-21T10:00:00Z',
      result: 'pending',
      interviewerNames: [],
    })

    expect(result).toMatchObject({
      ok: false,
      error: {
        code: 'validation',
        message: 'Interview pipelineEventId must belong to the same vacancy',
      },
    })
  })
})
