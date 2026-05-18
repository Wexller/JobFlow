import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { JobflowRepository } from '../../app/repositories/jobflow'

const prismaRepository = { kind: 'prisma' } as unknown as JobflowRepository
const sqlRepository = { kind: 'sql' } as unknown as JobflowRepository
const memoryRepository = { kind: 'memory' } as unknown as JobflowRepository

const createMockRepository = vi.fn(() => memoryRepository)
const createPostgresJobflowRepository = vi.fn(() => sqlRepository)
const createPrismaJobflowRepository = vi.fn(() => prismaRepository)
vi.mock('../../app/repositories/mockRepository', () => ({
  createMockRepository,
}))

vi.mock('../../server/repositories/postgresJobflowRepository', () => ({
  createPostgresJobflowRepository,
}))

vi.mock('../../server/repositories/prismaJobflowRepository', () => ({
  createPrismaJobflowRepository,
}))

describe('server repository adapter selection', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('uses sql adapter by default for postgres driver', async () => {
    const { getServerJobflowRepositoryWithConfig } = await import('../../server/repositories/jobflowRepository')
    const repository = getServerJobflowRepositoryWithConfig({
      jobflowPersistenceDriver: 'postgres',
      postgresAdapter: 'sql',
    })

    expect(createPostgresJobflowRepository).toHaveBeenCalledTimes(1)
    expect(createPrismaJobflowRepository).not.toHaveBeenCalled()
    expect(repository).toBe(sqlRepository)
  })

  it('uses prisma adapter when explicitly enabled', async () => {
    const { getServerJobflowRepositoryWithConfig } = await import('../../server/repositories/jobflowRepository')
    const repository = getServerJobflowRepositoryWithConfig({
      jobflowPersistenceDriver: 'postgres',
      postgresAdapter: 'prisma',
    })

    expect(createPrismaJobflowRepository).toHaveBeenCalledTimes(1)
    expect(createPostgresJobflowRepository).not.toHaveBeenCalled()
    expect(repository).toBe(prismaRepository)
  })

  it('falls back to memory repository when persistence driver is not postgres', async () => {
    const { getServerJobflowRepositoryWithConfig } = await import('../../server/repositories/jobflowRepository')
    const repository = getServerJobflowRepositoryWithConfig({
      jobflowPersistenceDriver: 'memory',
      postgresAdapter: 'prisma',
    })

    expect(createMockRepository).toHaveBeenCalledTimes(1)
    expect(createPrismaJobflowRepository).not.toHaveBeenCalled()
    expect(createPostgresJobflowRepository).not.toHaveBeenCalled()
    expect(repository).toBe(memoryRepository)
  })
})
