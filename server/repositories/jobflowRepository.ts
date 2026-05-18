import { useRuntimeConfig } from '#imports'
import type { JobflowRepository } from '../../app/repositories/jobflow'
import { createMockRepository } from '../../app/repositories/mockRepository'
import { createPostgresJobflowRepository } from './postgresJobflowRepository'
import { createPrismaJobflowRepository } from './prismaJobflowRepository'

const MEMORY_REPOSITORY_KEY = '__jobflowMemoryRepository__'

function getMemoryRepository() {
  const globalScope = globalThis as typeof globalThis & {
    [MEMORY_REPOSITORY_KEY]?: JobflowRepository
  }

  if (globalScope[MEMORY_REPOSITORY_KEY] === undefined) {
    globalScope[MEMORY_REPOSITORY_KEY] = createMockRepository()
  }

  return globalScope[MEMORY_REPOSITORY_KEY]
}

type RuntimeConfigShape = {
  readonly jobflowPersistenceDriver?: string
  readonly postgresAdapter?: string
}

export function getServerJobflowRepository(): JobflowRepository {
  return getServerJobflowRepositoryWithConfig(useRuntimeConfig() as RuntimeConfigShape)
}

export function getServerJobflowRepositoryWithConfig(config: RuntimeConfigShape): JobflowRepository {

  if (config.jobflowPersistenceDriver === 'postgres') {
    if (config.postgresAdapter === 'prisma') {
      return createPrismaJobflowRepository()
    }

    return createPostgresJobflowRepository()
  }

  return getMemoryRepository()
}

export function resetServerJobflowRepository() {
  const globalScope = globalThis as typeof globalThis & {
    [MEMORY_REPOSITORY_KEY]?: JobflowRepository
  }

  globalScope[MEMORY_REPOSITORY_KEY] = undefined
}
