import { createAppError, err, type Result } from '../../app/utils/result'
import type { JobflowRepository } from '../../app/repositories/jobflow'

function notConfiguredResult<T>(): Promise<Result<T>> {
  return Promise.resolve(err(createAppError(
    'unknown',
    'Postgres persistence is not configured in this workspace yet',
  )))
}

export function createPostgresJobflowRepository(): JobflowRepository {
  return {
    createInterview: () => notConfiguredResult(),
    createOffer: () => notConfiguredResult(),
    createPipelineEvent: () => notConfiguredResult(),
    createVacancy: () => notConfiguredResult(),
    getSnapshot: () => notConfiguredResult(),
    getVacancyDetails: () => notConfiguredResult(),
    listVacancies: () => notConfiguredResult(),
    updateInterview: () => notConfiguredResult(),
    updateOffer: () => notConfiguredResult(),
    updatePipelineEvent: () => notConfiguredResult(),
    updateVacancy: () => notConfiguredResult(),
  }
}
