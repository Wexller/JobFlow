import { describe, expect, it } from 'vitest'
import { createJobflowApiRepository } from '../../app/repositories/jobflowApiRepository'

describe('jobflow api repository', () => {
  it('maps fetch failures into app errors with request correlation details', async () => {
    const repository = createJobflowApiRepository(async () => {
      throw {
        data: {
          code: 'conflict',
          message: 'Vacancy already exists',
          requestId: 'request-456',
        },
      }
    })

    const result = await repository.createVacancy({
      id: 'vacancy-1',
      company: 'Acme',
      role: 'Frontend Engineer',
      status: 'applied',
      priority: 'high',
      format: 'remote',
      techStack: [],
      createdAt: '2026-05-18T10:00:00Z',
      updatedAt: '2026-05-18T10:00:00Z',
    })

    expect(result).toMatchObject({
      ok: false,
      error: {
        code: 'conflict',
        message: 'Vacancy already exists',
        details: {
          requestId: 'request-456',
        },
      },
    })
  })
})
