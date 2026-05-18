import { type JobflowSnapshot, jobflowSnapshotSchema } from '../schemas/jobflow.schema'
import { buildVacancyDetails, upsertById } from '../utils/jobflow'
import type { Result } from '../utils/result'
import { createAppError, err, ok } from '../utils/result'
import type { JobflowRepository } from './jobflow'

function clone<T>(value: T): T {
  return structuredClone(value)
}

function parseSnapshot(snapshot: JobflowSnapshot): Result<JobflowSnapshot> {
  const parsed = jobflowSnapshotSchema.safeParse(snapshot)

  if (parsed.success) {
    return ok(parsed.data)
  }

  return err(createAppError('validation', 'Invalid repository seed data', {
    cause: parsed.error,
  }))
}

function ensureEntityIdMatches(expectedId: string, actualId: string, entityType: string) {
  if (expectedId === actualId) {
    return ok(actualId)
  }

  return err(createAppError('validation', `Mismatched ${entityType} identifier`))
}

function ensureVacancyExists(snapshot: JobflowSnapshot, vacancyId: string) {
  if (snapshot.vacancies.some((vacancy) => vacancy.id === vacancyId)) {
    return ok(vacancyId)
  }

  return err(createAppError('not_found', `Vacancy ${vacancyId} was not found`))
}

function ensurePipelineEventBelongsToVacancy(snapshot: JobflowSnapshot, pipelineEventId: string, vacancyId: string) {
  const pipelineEvent = snapshot.pipelineEvents.find((existingPipelineEvent) => existingPipelineEvent.id === pipelineEventId)

  if (pipelineEvent === undefined) {
    return err(createAppError('not_found', `Pipeline event ${pipelineEventId} was not found`))
  }

  if (pipelineEvent.vacancyId !== vacancyId) {
    return err(createAppError('validation', 'Interview pipelineEventId must belong to the same vacancy'))
  }

  return ok(pipelineEventId)
}

export function createInMemoryJobflowRepository(seed: JobflowSnapshot): JobflowRepository {
  const snapshotResult = parseSnapshot(clone(seed))

  if (!snapshotResult.ok) {
    throw snapshotResult.error
  }

  const state = clone(snapshotResult.value)

  async function readSnapshot(): Promise<Result<JobflowSnapshot>> {
    return ok(clone(state))
  }

  return {
    async getSnapshot() {
      return readSnapshot()
    },
    async listVacancies() {
      return ok(clone(state.vacancies))
    },
    async getVacancyDetails(vacancyId) {
      const details = buildVacancyDetails(state, vacancyId)

      if (details === undefined) {
        return err(createAppError('not_found', `Vacancy ${vacancyId} was not found`))
      }

      return ok(clone(details))
    },
    async createVacancy(vacancy) {
      if (state.vacancies.some((existingVacancy) => existingVacancy.id === vacancy.id)) {
        return err(createAppError('conflict', `Vacancy ${vacancy.id} already exists`))
      }

      state.vacancies = [...state.vacancies, clone(vacancy)]
      return ok(clone(vacancy))
    },
    async updateVacancy(vacancyId, vacancy) {
      const idResult = ensureEntityIdMatches(vacancyId, vacancy.id, 'vacancy')

      if (!idResult.ok) {
        return idResult
      }

      if (!state.vacancies.some((existingVacancy) => existingVacancy.id === vacancyId)) {
        return err(createAppError('not_found', `Vacancy ${vacancyId} was not found`))
      }

      state.vacancies = upsertById(state.vacancies, clone(vacancy))
      return ok(clone(vacancy))
    },
    async createPipelineEvent(pipelineEvent) {
      const vacancyResult = ensureVacancyExists(state, pipelineEvent.vacancyId)

      if (!vacancyResult.ok) {
        return vacancyResult
      }

      if (state.pipelineEvents.some((existingEvent) => existingEvent.id === pipelineEvent.id)) {
        return err(createAppError('conflict', `Pipeline event ${pipelineEvent.id} already exists`))
      }

      state.pipelineEvents = [...state.pipelineEvents, clone(pipelineEvent)]
      return ok(clone(pipelineEvent))
    },
    async updatePipelineEvent(pipelineEventId, pipelineEvent) {
      const idResult = ensureEntityIdMatches(pipelineEventId, pipelineEvent.id, 'pipeline event')

      if (!idResult.ok) {
        return idResult
      }

      const vacancyResult = ensureVacancyExists(state, pipelineEvent.vacancyId)

      if (!vacancyResult.ok) {
        return vacancyResult
      }

      if (!state.pipelineEvents.some((existingEvent) => existingEvent.id === pipelineEventId)) {
        return err(createAppError('not_found', `Pipeline event ${pipelineEventId} was not found`))
      }

      state.pipelineEvents = upsertById(state.pipelineEvents, clone(pipelineEvent))
      return ok(clone(pipelineEvent))
    },
    async createInterview(interview) {
      const vacancyResult = ensureVacancyExists(state, interview.vacancyId)

      if (!vacancyResult.ok) {
        return vacancyResult
      }

      if (interview.pipelineEventId !== undefined) {
        const pipelineEventResult = ensurePipelineEventBelongsToVacancy(state, interview.pipelineEventId, interview.vacancyId)

        if (!pipelineEventResult.ok) {
          return pipelineEventResult
        }
      }

      if (state.interviews.some((existingInterview) => existingInterview.id === interview.id)) {
        return err(createAppError('conflict', `Interview ${interview.id} already exists`))
      }

      state.interviews = [...state.interviews, clone(interview)]
      return ok(clone(interview))
    },
    async updateInterview(interviewId, interview) {
      const idResult = ensureEntityIdMatches(interviewId, interview.id, 'interview')

      if (!idResult.ok) {
        return idResult
      }

      const vacancyResult = ensureVacancyExists(state, interview.vacancyId)

      if (!vacancyResult.ok) {
        return vacancyResult
      }

      if (interview.pipelineEventId !== undefined) {
        const pipelineEventResult = ensurePipelineEventBelongsToVacancy(state, interview.pipelineEventId, interview.vacancyId)

        if (!pipelineEventResult.ok) {
          return pipelineEventResult
        }
      }

      if (!state.interviews.some((existingInterview) => existingInterview.id === interviewId)) {
        return err(createAppError('not_found', `Interview ${interviewId} was not found`))
      }

      state.interviews = upsertById(state.interviews, clone(interview))
      return ok(clone(interview))
    },
    async createOffer(offer) {
      const vacancyResult = ensureVacancyExists(state, offer.vacancyId)

      if (!vacancyResult.ok) {
        return vacancyResult
      }

      if (state.offers.some((existingOffer) => existingOffer.id === offer.id)) {
        return err(createAppError('conflict', `Offer ${offer.id} already exists`))
      }

      state.offers = [...state.offers, clone(offer)]
      return ok(clone(offer))
    },
    async updateOffer(offerId, offer) {
      const idResult = ensureEntityIdMatches(offerId, offer.id, 'offer')

      if (!idResult.ok) {
        return idResult
      }

      const vacancyResult = ensureVacancyExists(state, offer.vacancyId)

      if (!vacancyResult.ok) {
        return vacancyResult
      }

      if (!state.offers.some((existingOffer) => existingOffer.id === offerId)) {
        return err(createAppError('not_found', `Offer ${offerId} was not found`))
      }

      state.offers = upsertById(state.offers, clone(offer))
      return ok(clone(offer))
    },
  }
}
