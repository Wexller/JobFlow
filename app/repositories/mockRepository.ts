import { createInMemoryJobflowRepository } from './inMemoryJobflowRepository'
import type { JobflowRepository } from './jobflow'
import { mockInterviews, mockOffers, mockPipelineEvents, mockVacancies } from './mockData'

export function createMockRepository(): JobflowRepository {
  return createInMemoryJobflowRepository({
    interviews: mockInterviews,
    offers: mockOffers,
    pipelineEvents: mockPipelineEvents,
    vacancies: mockVacancies,
  })
}

export type { JobflowRepository } from './jobflow'
