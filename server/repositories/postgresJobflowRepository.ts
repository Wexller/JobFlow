import type { JobflowRepository } from '../../app/repositories/jobflow'
import { createAppError, err, type Result } from '../../app/utils/result'
import { createPostgresSqlClient } from './postgres/sqlClient'

function notImplementedResult<T>(message: string): Promise<Result<T>> {
  return Promise.resolve(err(createAppError('unknown', message)))
}

export function createPostgresJobflowRepository(): JobflowRepository {
  return {
    async getSnapshot() {
      await createPostgresSqlClient()
      return notImplementedResult('Postgres repository adapter is not implemented yet')
    },
    async listVacancies() {
      await createPostgresSqlClient()
      return notImplementedResult('Postgres repository adapter is not implemented yet')
    },
    async getVacancyDetails() {
      await createPostgresSqlClient()
      return notImplementedResult('Postgres repository adapter is not implemented yet')
    },
    async createVacancy() {
      await createPostgresSqlClient()
      return notImplementedResult('Postgres repository adapter is not implemented yet')
    },
    async updateVacancy() {
      await createPostgresSqlClient()
      return notImplementedResult('Postgres repository adapter is not implemented yet')
    },
    async createPipelineEvent() {
      await createPostgresSqlClient()
      return notImplementedResult('Postgres repository adapter is not implemented yet')
    },
    async updatePipelineEvent() {
      await createPostgresSqlClient()
      return notImplementedResult('Postgres repository adapter is not implemented yet')
    },
    async createInterview() {
      await createPostgresSqlClient()
      return notImplementedResult('Postgres repository adapter is not implemented yet')
    },
    async updateInterview() {
      await createPostgresSqlClient()
      return notImplementedResult('Postgres repository adapter is not implemented yet')
    },
    async createOffer() {
      await createPostgresSqlClient()
      return notImplementedResult('Postgres repository adapter is not implemented yet')
    },
    async updateOffer() {
      await createPostgresSqlClient()
      return notImplementedResult('Postgres repository adapter is not implemented yet')
    },
  }
}
