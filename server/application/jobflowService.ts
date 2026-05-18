import {
  normalizeInterviewPayload,
  normalizeOfferPayload,
  normalizePipelineEventPayload,
  normalizeVacancyPayload,
} from '../../app/mappers/formPayloads'
import type { JobflowRepository } from '../../app/repositories/jobflow'

export function createJobflowService(repository: JobflowRepository) {
  return {
    getSnapshot: () => repository.getSnapshot(),
    listVacancies: () => repository.listVacancies(),
    getVacancyDetails: (vacancyId: string) => repository.getVacancyDetails(vacancyId),
    async createVacancy(payload: unknown) {
      const normalized = normalizeVacancyPayload(payload)
      return normalized.ok ? repository.createVacancy(normalized.value) : normalized
    },
    async updateVacancy(vacancyId: string, payload: unknown) {
      const normalized = normalizeVacancyPayload(payload)
      return normalized.ok ? repository.updateVacancy(vacancyId, normalized.value) : normalized
    },
    async createPipelineEvent(payload: unknown) {
      const normalized = normalizePipelineEventPayload(payload)
      return normalized.ok ? repository.createPipelineEvent(normalized.value) : normalized
    },
    async updatePipelineEvent(pipelineEventId: string, payload: unknown) {
      const normalized = normalizePipelineEventPayload(payload)
      return normalized.ok ? repository.updatePipelineEvent(pipelineEventId, normalized.value) : normalized
    },
    async createInterview(payload: unknown) {
      const normalized = normalizeInterviewPayload(payload)
      return normalized.ok ? repository.createInterview(normalized.value) : normalized
    },
    async updateInterview(interviewId: string, payload: unknown) {
      const normalized = normalizeInterviewPayload(payload)
      return normalized.ok ? repository.updateInterview(interviewId, normalized.value) : normalized
    },
    async createOffer(payload: unknown) {
      const normalized = normalizeOfferPayload(payload)
      return normalized.ok ? repository.createOffer(normalized.value) : normalized
    },
    async updateOffer(offerId: string, payload: unknown) {
      const normalized = normalizeOfferPayload(payload)
      return normalized.ok ? repository.updateOffer(offerId, normalized.value) : normalized
    },
  }
}
