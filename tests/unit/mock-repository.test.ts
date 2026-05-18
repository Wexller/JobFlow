import { describe, expect, it } from 'vitest'
import { createMockRepository } from '../../app/repositories/mockRepository'

describe('mock repository', () => {
  it('returns a schema-valid jobflow snapshot', async () => {
    const repository = createMockRepository()
    const result = await repository.getSnapshot()

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    expect(result.value.vacancies).toHaveLength(4)
    expect(result.value.pipelineEvents.length).toBeGreaterThan(0)
    expect(result.value.interviews.length).toBeGreaterThan(0)
    expect(result.value.offers).toHaveLength(1)
  })

  it('keeps related entities linked by stable IDs', async () => {
    const repository = createMockRepository()
    const result = await repository.getSnapshot()

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    const vacancyIds = new Set(result.value.vacancies.map((vacancy) => vacancy.id))
    const pipelineEventIds = new Set(result.value.pipelineEvents.map((event) => event.id))

    expect(result.value.pipelineEvents.every((event) => vacancyIds.has(event.vacancyId))).toBe(true)
    expect(result.value.interviews.every((interview) => vacancyIds.has(interview.vacancyId))).toBe(true)
    expect(result.value.interviews.every((interview) =>
      interview.pipelineEventId === undefined || pipelineEventIds.has(interview.pipelineEventId),
    )).toBe(true)
    expect(result.value.offers.every((offer) => vacancyIds.has(offer.vacancyId))).toBe(true)
  })

  it('returns cloned data so callers cannot mutate repository fixtures', async () => {
    const repository = createMockRepository()
    const firstResult = await repository.listVacancies()
    const secondResult = await repository.listVacancies()

    expect(firstResult.ok).toBe(true)
    expect(secondResult.ok).toBe(true)

    if (!firstResult.ok || !secondResult.ok) {
      return
    }

    firstResult.value[0].company = 'Changed Locally'

    expect(secondResult.value[0].company).toBe('Northstar Labs')
  })

  it('supports create and update operations through stable IDs', async () => {
    const repository = createMockRepository()

    const createResult = await repository.createVacancy({
      id: 'vacancy-created',
      company: 'Created Co',
      role: 'Backend Engineer',
      status: 'wishlist',
      priority: 'medium',
      format: 'remote',
      techStack: ['Nuxt', 'PostgreSQL'],
      createdAt: '2026-05-18T10:00:00Z',
      updatedAt: '2026-05-18T10:00:00Z',
    })

    expect(createResult.ok).toBe(true)

    if (!createResult.ok) {
      return
    }

    const updateResult = await repository.updateVacancy(createResult.value.id, {
      ...createResult.value,
      priority: 'urgent',
      updatedAt: '2026-05-18T11:00:00Z',
    })

    expect(updateResult).toMatchObject({
      ok: true,
      value: {
        id: 'vacancy-created',
        priority: 'urgent',
      },
    })

    const detailsResult = await repository.getVacancyDetails('vacancy-created')

    expect(detailsResult).toMatchObject({
      ok: true,
      value: {
        vacancy: {
          id: 'vacancy-created',
        },
      },
    })
  })

  it('rejects interviews whose pipeline event belongs to another vacancy', async () => {
    const repository = createMockRepository()

    const result = await repository.createInterview({
      id: 'interview-invalid-link',
      vacancyId: 'vacancy-design-systems',
      pipelineEventId: 'pipeline-crm-screen',
      stage: 'recruiter_screen',
      scheduledAt: '2026-05-21T10:00:00Z',
      result: 'pending',
      interviewerNames: [],
    })

    expect(result).toMatchObject({
      ok: false,
      error: {
        code: 'validation',
        message: 'Interview pipelineEventId must belong to the same vacancy',
      },
    })
  })
})
