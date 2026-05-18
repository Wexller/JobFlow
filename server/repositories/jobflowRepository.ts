import type { JobflowRepository } from '../../app/repositories/jobflow'
import { createMockRepository } from '../../app/repositories/mockRepository'
import { createPostgresJobflowRepository } from './postgresJobflowRepository'

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

export function getServerJobflowRepository(): JobflowRepository {
  const config = useRuntimeConfig()

  if (config.jobflowPersistenceDriver === 'postgres') {
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
