import { PrismaClient } from '@prisma/client'
import type { JobflowRepository } from '../../app/repositories/jobflow'
import { createPostgresJobflowRepository } from './postgresJobflowRepository'

const PRISMA_CLIENT_KEY = '__jobflowPrismaClient__'

function getPrismaClient() {
  const globalScope = globalThis as typeof globalThis & {
    [PRISMA_CLIENT_KEY]?: PrismaClient
  }

  if (globalScope[PRISMA_CLIENT_KEY] === undefined) {
    globalScope[PRISMA_CLIENT_KEY] = new PrismaClient()
  }

  return globalScope[PRISMA_CLIENT_KEY]
}

/**
 * Milestone 6 scaffold: keep behavior parity by delegating to the proven SQL
 * repository while the Prisma-native CRUD implementation is introduced
 * incrementally behind the same contract.
 */
export function createPrismaJobflowRepository(): JobflowRepository {
  getPrismaClient()
  return createPostgresJobflowRepository()
}
