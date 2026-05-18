import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { createMockRepository } from '../../app/repositories/mockRepository'
import type { JobflowRepository } from '../../app/repositories/jobflow'
import type { JobflowSnapshot } from '../../app/schemas/jobflow.schema'
import { useJobflowStore } from '../../app/stores/jobflow'
import { createAppError, err, ok } from '../../app/utils/result'

function createRepositoryStub(overrides: Partial<JobflowRepository> = {}): JobflowRepository {
  return {
    createInterview: async (interview) => ok(interview),
    createOffer: async (offer) => ok(offer),
    createPipelineEvent: async (pipelineEvent) => ok(pipelineEvent),
    createVacancy: async (vacancy) => ok(vacancy),
    getSnapshot: async () => ok({
      interviews: [],
      offers: [],
      pipelineEvents: [],
      vacancies: [],
    }),
    getVacancyDetails: async () => err(createAppError('not_found', 'Vacancy not found')),
    listVacancies: async () => ok([]),
    updateInterview: async (_interviewId, interview) => ok(interview),
    updateOffer: async (_offerId, offer) => ok(offer),
    updatePipelineEvent: async (_pipelineEventId, pipelineEvent) => ok(pipelineEvent),
    updateVacancy: async (_vacancyId, vacancy) => ok(vacancy),
    ...overrides,
  }
}

describe('jobflow store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('loads a mock snapshot and exposes sync state', async () => {
    const store = useJobflowStore()
    const result = await store.load(createMockRepository())

    expect(result.ok).toBe(true)
    expect(store.sync.status).toBe('success')
    expect(store.sync.lastLoadedAt).toBeDefined()
    expect(store.vacancies).toHaveLength(4)
    expect(store.pipelineEvents.length).toBeGreaterThan(0)
    expect(store.interviews).toHaveLength(2)
    expect(store.offers).toHaveLength(1)
  })

  it('sets sync status to loading while snapshot is in-flight', async () => {
    const store = useJobflowStore()

    let resolveSnapshot: ((value: ReturnType<typeof ok<JobflowSnapshot>>) => void) | undefined
    const repository = createRepositoryStub({
      getSnapshot: () => new Promise((resolve) => {
        resolveSnapshot = resolve
      }),
    })

    const loadingPromise = store.load(repository)
    expect(store.sync.status).toBe('loading')

    resolveSnapshot?.(ok({
      interviews: [],
      offers: [],
      pipelineEvents: [],
      vacancies: [],
    }))

    await loadingPromise
    expect(store.sync.status).toBe('success')
  })

  it('sets sync error state when snapshot load fails', async () => {
    const store = useJobflowStore()

    const repository = createRepositoryStub({
      getSnapshot: async () => err(createAppError('google_sheets', 'Snapshot unavailable')),
    })

    const result = await store.load(repository)

    expect(result.ok).toBe(false)
    expect(store.sync.status).toBe('error')
    expect(store.sync.errorMessage).toBe('Snapshot unavailable')
  })

  it('filters vacancies by stable enum IDs and text facets', async () => {
    const store = useJobflowStore()
    await store.load(createMockRepository())

    store.setFilters({
      formats: ['remote'],
      priorities: ['high', 'urgent'],
      statuses: ['interviewing', 'offer'],
      techStack: ['Vue'],
    })

    expect(store.filteredVacancies.map((vacancy) => vacancy.id)).toEqual([
      'vacancy-frontend-platform',
      'vacancy-design-systems',
    ])

    store.setFilters({ query: 'design systems' })

    expect(store.filteredVacancies.map((vacancy) => vacancy.id)).toEqual([
      'vacancy-design-systems',
    ])
  })

  it('sorts vacancies by priority, salary, match score, and applied date', async () => {
    const store = useJobflowStore()
    await store.load(createMockRepository())

    store.setSort({ direction: 'desc', key: 'priority' })
    expect(store.filteredVacancies[0].priority).toBe('urgent')

    store.setSort({ direction: 'desc', key: 'salary' })
    expect(store.filteredVacancies[0].id).toBe('vacancy-design-systems')

    store.setSort({ direction: 'desc', key: 'match_score' })
    expect(store.filteredVacancies[0].id).toBe('vacancy-frontend-platform')

    store.setSort({ direction: 'asc', key: 'applied_at' })
    expect(store.filteredVacancies[0].id).toBe('vacancy-legacy-modernization')
  })

  it('groups vacancies for kanban by status', async () => {
    const store = useJobflowStore()
    await store.load(createMockRepository())

    expect(store.kanbanGroups.interviewing.map((vacancy) => vacancy.id)).toEqual([
      'vacancy-frontend-platform',
    ])
    expect(store.kanbanGroups.offer.map((vacancy) => vacancy.id)).toEqual([
      'vacancy-design-systems',
    ])
    expect(store.kanbanGroups.archived).toEqual([])
  })

  it('derives dashboard metrics from normalized data', async () => {
    const store = useJobflowStore()
    await store.load(createMockRepository())
    store.setReferenceDate('2026-05-17T00:00:00Z')

    const metrics = Object.fromEntries(store.dashboardMetrics.map((metric) => [metric.id, metric]))

    expect(metrics.total_applications?.value).toBe(4)
    expect(metrics.active_processes?.value).toBe(3)
    expect(metrics.interviews_this_week?.value).toBe(2)
    expect(metrics.offers?.value).toBe(1)
    expect(metrics.reply_rate?.rate).toBe(100)
    expect(metrics.interview_rate?.rate).toBe(50)
    expect(metrics.offer_rate?.rate).toBe(25)
    expect(metrics.next_actions?.value).toBe(3)
  })

  it('returns joined vacancy details in timeline order', async () => {
    const store = useJobflowStore()
    await store.load(createMockRepository())

    const details = store.vacancyDetails('vacancy-frontend-platform')

    expect(details?.vacancy.company).toBe('Northstar Labs')
    expect(details?.pipelineEvents.map((event) => event.id)).toEqual([
      'pipeline-platform-applied',
      'pipeline-platform-technical',
    ])
    expect(details?.interviews.map((interview) => interview.id)).toEqual([
      'interview-platform-technical',
    ])
    expect(details?.offer).toBeUndefined()
  })

  it('creates and updates vacancies through the validated API boundary', async () => {
    const store = useJobflowStore()
    const repository = createMockRepository()
    await store.load(repository)

    const createResult = await store.saveVacancy({
      id: 'vacancy-new',
      company: ' NewCo ',
      role: ' Staff Frontend Engineer ',
      status: 'wishlist',
      priority: 'medium',
      format: 'remote',
      techStack: 'Vue, TypeScript',
      createdAt: '2026-05-17T10:00:00Z',
      updatedAt: '2026-05-17T10:00:00Z',
    }, repository)

    expect(createResult).toMatchObject({
      ok: true,
      value: {
        company: 'NewCo',
        id: 'vacancy-new',
        techStack: ['Vue', 'TypeScript'],
      },
    })
    expect(store.vacancies.some((vacancy) => vacancy.id === 'vacancy-new')).toBe(true)

    const updateResult = await store.saveVacancy({
      ...store.vacancies.find((vacancy) => vacancy.id === 'vacancy-new'),
      priority: 'urgent',
      role: 'Principal Frontend Engineer',
      updatedAt: '2026-05-18T10:00:00Z',
    }, repository)

    expect(updateResult).toMatchObject({
      ok: true,
      value: {
        priority: 'urgent',
        role: 'Principal Frontend Engineer',
      },
    })
    expect(store.vacancies.filter((vacancy) => vacancy.id === 'vacancy-new')).toHaveLength(1)
  })

  it('rejects invalid vacancy form payloads without mutating state', async () => {
    const store = useJobflowStore()
    await store.load(createMockRepository())
    const initialCount = store.vacancies.length

    const result = await store.saveVacancy({
      id: 'vacancy-invalid',
      company: '',
      role: 'Frontend Engineer',
      status: 'localized status',
      priority: 'medium',
      format: 'remote',
      createdAt: '2026-05-17T10:00:00Z',
      updatedAt: '2026-05-17T10:00:00Z',
    })

    expect(result).toMatchObject({
      ok: false,
      error: {
        code: 'validation',
      },
    })
    expect(store.vacancies).toHaveLength(initialCount)
  })

  it('creates and updates pipeline events through the validated API boundary', async () => {
    const store = useJobflowStore()
    const repository = createMockRepository()
    await store.load(repository)

    const createResult = await store.savePipelineEvent({
      id: 'pipeline-new-event',
      vacancyId: 'vacancy-frontend-platform',
      stage: 'technical_screen',
      status: 'planned',
      title: 'Architecture deep dive',
      scheduledAt: '2026-05-22T10:00:00Z',
    }, repository)

    expect(createResult).toMatchObject({
      ok: true,
      value: {
        id: 'pipeline-new-event',
        title: 'Architecture deep dive',
      },
    })

    const updateResult = await store.savePipelineEvent({
      id: 'pipeline-new-event',
      vacancyId: 'vacancy-frontend-platform',
      stage: 'technical_screen',
      status: 'completed',
      title: 'Architecture deep dive complete',
      completedAt: '2026-05-22T12:00:00Z',
    }, repository)

    expect(updateResult).toMatchObject({
      ok: true,
      value: {
        id: 'pipeline-new-event',
        status: 'completed',
      },
    })
    expect(store.pipelineEvents.filter((event) => event.id === 'pipeline-new-event')).toHaveLength(1)
  })

  it('rejects invalid pipeline event payloads without mutating state', async () => {
    const store = useJobflowStore()
    await store.load(createMockRepository())
    const initialCount = store.pipelineEvents.length

    const result = await store.savePipelineEvent({
      id: 'pipeline-invalid',
      vacancyId: 'vacancy-frontend-platform',
      stage: 'Технический этап',
      status: 'scheduled',
    })

    expect(result).toMatchObject({
      ok: false,
      error: {
        code: 'validation',
      },
    })
    expect(store.pipelineEvents).toHaveLength(initialCount)
  })

  it('creates and updates interviews through the validated API boundary', async () => {
    const store = useJobflowStore()
    const repository = createMockRepository()
    await store.load(repository)

    const createResult = await store.saveInterview({
      id: 'interview-new',
      vacancyId: 'vacancy-frontend-platform',
      stage: 'technical_screen',
      result: 'pending',
      scheduledAt: '2026-05-23T10:00:00Z',
      interviewerNames: 'Maya, Oleg',
    }, repository)

    expect(createResult).toMatchObject({ ok: true, value: { id: 'interview-new' } })

    const updateResult = await store.saveInterview({
      id: 'interview-new',
      vacancyId: 'vacancy-frontend-platform',
      stage: 'technical_screen',
      result: 'passed',
      scheduledAt: '2026-05-23T10:00:00Z',
      interviewerNames: 'Maya, Oleg',
    }, repository)

    expect(updateResult).toMatchObject({ ok: true, value: { result: 'passed' } })
  })

  it('creates and updates offers through the validated API boundary', async () => {
    const store = useJobflowStore()
    const repository = createMockRepository()
    await store.load(repository)

    const createResult = await store.saveOffer({
      id: 'offer-new',
      vacancyId: 'vacancy-frontend-platform',
      decision: 'pending',
      salaryMin: '100000',
      salaryMax: '120000',
      currency: 'EUR',
    }, repository)

    expect(createResult).toMatchObject({ ok: true, value: { id: 'offer-new' } })

    const updateResult = await store.saveOffer({
      id: 'offer-new',
      vacancyId: 'vacancy-frontend-platform',
      decision: 'accepted',
      salaryMin: '110000',
      salaryMax: '130000',
      currency: 'EUR',
    }, repository)

    expect(updateResult).toMatchObject({ ok: true, value: { decision: 'accepted' } })
  })
})
