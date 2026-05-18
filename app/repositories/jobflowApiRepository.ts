import { ofetch } from 'ofetch'
import type { Interview } from '../schemas/interviews.schema'
import type { Offer } from '../schemas/offers.schema'
import type { PipelineEvent } from '../schemas/pipeline.schema'
import type { Vacancy } from '../schemas/vacancies.schema'
import { createAppError, err, ok, type Result } from '../utils/result'
import type { JobflowRepository } from './jobflow'

export interface FetchErrorShape {
  readonly data?: {
    readonly code?: string
    readonly message?: string
    readonly requestId?: string
  }
  readonly message?: string
  readonly statusMessage?: string
}

export type JobflowFetcher = <T>(request: string, options?: {
  readonly method?: string
  readonly body?: Record<string, unknown> | BodyInit | null
}) => Promise<T>

function toAppError(error: unknown) {
  const fetchError = error as FetchErrorShape
  const requestId = fetchError.data?.requestId

  return createAppError(
    fetchError.data?.code === 'validation'
      || fetchError.data?.code === 'not_found'
      || fetchError.data?.code === 'unauthorized'
      || fetchError.data?.code === 'forbidden'
      || fetchError.data?.code === 'google_sheets'
      || fetchError.data?.code === 'conflict'
      ? fetchError.data.code
      : 'network',
    fetchError.data?.message ?? fetchError.statusMessage ?? fetchError.message ?? 'Request failed',
    requestId === undefined ? {} : { details: { requestId } },
  )
}

async function request<T>(fetcher: JobflowFetcher, path: string, options?: {
  readonly method?: 'GET' | 'POST' | 'PUT'
  readonly body?: Record<string, unknown> | BodyInit | null
}): Promise<Result<T>> {
  try {
    return ok(await fetcher<T>(path, options))
  }
  catch (error) {
    return err(toAppError(error))
  }
}

export function createJobflowApiRepository(fetcher: JobflowFetcher = ofetch): JobflowRepository {
  return {
    createInterview: (interview: Interview) => request(fetcher, '/api/interviews', { body: interview, method: 'POST' }),
    createOffer: (offer: Offer) => request(fetcher, '/api/offers', { body: offer, method: 'POST' }),
    createPipelineEvent: (pipelineEvent: PipelineEvent) => request(fetcher, '/api/pipeline-events', { body: pipelineEvent, method: 'POST' }),
    createVacancy: (vacancy: Vacancy) => request(fetcher, '/api/vacancies', { body: vacancy, method: 'POST' }),
    getSnapshot: () => request(fetcher, '/api/jobflow/snapshot'),
    getVacancyDetails: (vacancyId: string) => request(fetcher, `/api/vacancies/${encodeURIComponent(vacancyId)}`),
    listVacancies: () => request(fetcher, '/api/vacancies'),
    updateInterview: (interviewId: string, interview: Interview) => request(fetcher, `/api/interviews/${encodeURIComponent(interviewId)}`, { body: interview, method: 'PUT' }),
    updateOffer: (offerId: string, offer: Offer) => request(fetcher, `/api/offers/${encodeURIComponent(offerId)}`, { body: offer, method: 'PUT' }),
    updatePipelineEvent: (pipelineEventId: string, pipelineEvent: PipelineEvent) => request(fetcher, `/api/pipeline-events/${encodeURIComponent(pipelineEventId)}`, { body: pipelineEvent, method: 'PUT' }),
    updateVacancy: (vacancyId: string, vacancy: Vacancy) => request(fetcher, `/api/vacancies/${encodeURIComponent(vacancyId)}`, { body: vacancy, method: 'PUT' }),
  }
}
