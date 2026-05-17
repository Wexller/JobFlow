import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useJobflowStore } from '../../app/stores/jobflow'

describe('jobflow store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('loads a mock snapshot and exposes sync state', async () => {
    const store = useJobflowStore()
    const result = await store.load()

    expect(result.ok).toBe(true)
    expect(store.sync.status).toBe('success')
    expect(store.sync.lastLoadedAt).toBeDefined()
    expect(store.vacancies).toHaveLength(4)
    expect(store.pipelineEvents.length).toBeGreaterThan(0)
    expect(store.interviews).toHaveLength(2)
    expect(store.offers).toHaveLength(1)
  })

  it('filters vacancies by stable enum IDs and text facets', async () => {
    const store = useJobflowStore()
    await store.load()

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
    await store.load()

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
    await store.load()

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
    await store.load()
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
    await store.load()

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
})
