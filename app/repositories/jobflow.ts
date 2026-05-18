import type { Interview } from '../schemas/interviews.schema'
import type { Offer } from '../schemas/offers.schema'
import type { PipelineEvent } from '../schemas/pipeline.schema'
import type { JobflowSnapshot, VacancyDetails } from '../schemas/jobflow.schema'
import type { Vacancy } from '../schemas/vacancies.schema'
import type { Result } from '../utils/result'

export interface JobflowReadRepository {
  readonly getSnapshot: () => Promise<Result<JobflowSnapshot>>
  readonly listVacancies: () => Promise<Result<Vacancy[]>>
  readonly getVacancyDetails: (vacancyId: string) => Promise<Result<VacancyDetails>>
}

export interface JobflowWriteRepository {
  readonly createVacancy: (vacancy: Vacancy) => Promise<Result<Vacancy>>
  readonly updateVacancy: (vacancyId: string, vacancy: Vacancy) => Promise<Result<Vacancy>>
  readonly createPipelineEvent: (pipelineEvent: PipelineEvent) => Promise<Result<PipelineEvent>>
  readonly updatePipelineEvent: (pipelineEventId: string, pipelineEvent: PipelineEvent) => Promise<Result<PipelineEvent>>
  readonly createInterview: (interview: Interview) => Promise<Result<Interview>>
  readonly updateInterview: (interviewId: string, interview: Interview) => Promise<Result<Interview>>
  readonly createOffer: (offer: Offer) => Promise<Result<Offer>>
  readonly updateOffer: (offerId: string, offer: Offer) => Promise<Result<Offer>>
}

export type JobflowRepository = JobflowReadRepository & JobflowWriteRepository
