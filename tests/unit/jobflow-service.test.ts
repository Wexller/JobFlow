import { describe, expect, it } from 'vitest'
import { createMockRepository } from '../../app/repositories/mockRepository'
import { createJobflowService } from '../../server/application/jobflowService'

describe('jobflow service', () => {
  it('normalizes and persists vacancies through the server application layer', async () => {
    const service = createJobflowService(createMockRepository())

    const createResult = await service.createVacancy({
      id: ' vacancy-service ',
      company: ' Service Co ',
      role: ' Platform Engineer ',
      status: 'applied',
      priority: 'high',
      format: 'remote',
      techStack: 'Nuxt, TypeScript',
      createdAt: '2026-05-18T10:00:00Z',
      updatedAt: '2026-05-18T10:00:00Z',
    })

    expect(createResult).toMatchObject({
      ok: true,
      value: {
        company: 'Service Co',
        id: 'vacancy-service',
        techStack: ['Nuxt', 'TypeScript'],
      },
    })

    if (!createResult.ok) {
      return
    }

    const updateResult = await service.updateVacancy(createResult.value.id, {
      ...createResult.value,
      priority: 'urgent',
      updatedAt: '2026-05-18T11:00:00Z',
    })

    expect(updateResult).toMatchObject({
      ok: true,
      value: {
        id: 'vacancy-service',
        priority: 'urgent',
      },
    })
  })

  it('rejects invalid server payloads before they reach persistence', async () => {
    const service = createJobflowService(createMockRepository())

    const result = await service.createVacancy({
      id: 'vacancy-invalid',
      company: '',
      role: 'Frontend Engineer',
      status: 'localized status',
      priority: 'medium',
      format: 'remote',
      createdAt: '2026-05-18T10:00:00Z',
      updatedAt: '2026-05-18T10:00:00Z',
    })

    expect(result).toMatchObject({
      ok: false,
      error: {
        code: 'validation',
      },
    })
  })
})
