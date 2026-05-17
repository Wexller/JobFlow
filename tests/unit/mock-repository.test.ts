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
})
