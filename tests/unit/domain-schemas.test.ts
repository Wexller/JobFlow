import { describe, expect, it } from 'vitest'
import { interviewResultIds, interviewStageIds } from '../../app/domain/interviews'
import { offerDecisionIds } from '../../app/domain/offers'
import { pipelineStageIds, pipelineStageStatusIds } from '../../app/domain/pipeline'
import { summaryMetricIds } from '../../app/domain/summary-metrics'
import { vacancyPriorityIds, vacancyStatusIds, workFormatIds } from '../../app/domain/vacancies'
import { interviewSchema } from '../../app/schemas/interviews.schema'
import { offerSchema } from '../../app/schemas/offers.schema'
import { pipelineEventSchema } from '../../app/schemas/pipeline.schema'
import { summaryMetricSchema } from '../../app/schemas/summary-metrics.schema'
import { vacancySchema } from '../../app/schemas/vacancies.schema'

describe('domain enum IDs', () => {
  it('defines stable enum IDs with an unknown fallback option', () => {
    expect(vacancyStatusIds).toContain('unknown')
    expect(vacancyPriorityIds).toContain('unknown')
    expect(workFormatIds).toContain('unknown')
    expect(pipelineStageIds).toContain('unknown')
    expect(pipelineStageStatusIds).toContain('unknown')
    expect(interviewStageIds).toContain('unknown')
    expect(interviewResultIds).toContain('unknown')
    expect(offerDecisionIds).toContain('unknown')
    expect(summaryMetricIds).toContain('unknown')
  })
})

describe('domain schemas', () => {
  const vacancy = {
    id: 'vacancy-1',
    company: 'Acme',
    role: 'Frontend Engineer',
    status: 'applied',
    priority: 'high',
    format: 'remote',
    techStack: ['Vue', 'TypeScript'],
    matchScore: 86,
    appliedAt: '2026-05-10',
    createdAt: '2026-05-01T09:00:00Z',
    updatedAt: '2026-05-12T09:30:00Z',
  }

  it('parses a normalized vacancy', () => {
    expect(vacancySchema.parse(vacancy)).toMatchObject({
      id: 'vacancy-1',
      status: 'applied',
      techStack: ['Vue', 'TypeScript'],
    })
  })

  it('parses pipeline, interview, offer, and summary metric objects', () => {
    expect(pipelineEventSchema.parse({
      id: 'pipeline-1',
      vacancyId: 'vacancy-1',
      stage: 'technical_screen',
      status: 'scheduled',
      scheduledAt: '2026-05-20T10:00:00Z',
    })).toMatchObject({ stage: 'technical_screen' })

    expect(interviewSchema.parse({
      id: 'interview-1',
      vacancyId: 'vacancy-1',
      stage: 'technical_screen',
      scheduledAt: '2026-05-20T10:00:00Z',
      result: 'pending',
    })).toMatchObject({ interviewerNames: [] })

    expect(offerSchema.parse({
      id: 'offer-1',
      vacancyId: 'vacancy-1',
      decision: 'pending',
      salaryMin: 100000,
      currency: 'USD',
    })).toMatchObject({ decision: 'pending' })

    expect(summaryMetricSchema.parse({
      id: 'reply_rate',
      value: 42,
      rate: 18.5,
      trend: 'up',
    })).toMatchObject({ trend: 'up' })
  })

  it.each([
    [
      'vacancy.status',
      () => vacancySchema.parse({ ...vacancy, status: 'Отклик отправлен' }),
    ],
    [
      'vacancy.priority',
      () => vacancySchema.parse({ ...vacancy, priority: 'Высокий' }),
    ],
    [
      'vacancy.format',
      () => vacancySchema.parse({ ...vacancy, format: 'Удаленно' }),
    ],
    [
      'pipeline.stage',
      () =>
        pipelineEventSchema.parse({
          id: 'pipeline-1',
          vacancyId: 'vacancy-1',
          stage: 'Техническое интервью',
          status: 'scheduled',
        }),
    ],
    [
      'pipeline.status',
      () =>
        pipelineEventSchema.parse({
          id: 'pipeline-1',
          vacancyId: 'vacancy-1',
          stage: 'technical_screen',
          status: 'Запланировано',
        }),
    ],
    [
      'interview.stage',
      () =>
        interviewSchema.parse({
          id: 'interview-1',
          vacancyId: 'vacancy-1',
          stage: 'Скрининг',
          scheduledAt: '2026-05-20T10:00:00Z',
          result: 'pending',
        }),
    ],
    [
      'interview.result',
      () =>
        interviewSchema.parse({
          id: 'interview-1',
          vacancyId: 'vacancy-1',
          stage: 'technical_screen',
          scheduledAt: '2026-05-20T10:00:00Z',
          result: 'Пройдено',
        }),
    ],
    [
      'offer.decision',
      () =>
        offerSchema.parse({
          id: 'offer-1',
          vacancyId: 'vacancy-1',
          decision: 'Принять',
        }),
    ],
    [
      'summaryMetric.id',
      () =>
        summaryMetricSchema.parse({
          id: 'Процент ответов',
          value: 42,
        }),
    ],
  ])('rejects localized labels for %s', (_field, parseValue) => {
    expect(parseValue).toThrow()
  })

  it('rejects impossible calendar dates', () => {
    expect(() =>
      vacancySchema.parse({
        ...vacancy,
        appliedAt: '2026-02-31',
      }),
    ).toThrow()

    expect(() =>
      interviewSchema.parse({
        id: 'interview-1',
        vacancyId: 'vacancy-1',
        stage: 'technical_screen',
        scheduledAt: '2026-05-20T99:00:00Z',
        result: 'pending',
      }),
    ).toThrow()
  })

  it('rejects reversed salary ranges', () => {
    expect(() =>
      vacancySchema.parse({
        ...vacancy,
        salaryMin: 150000,
        salaryMax: 100000,
      }),
    ).toThrow()

    expect(() =>
      offerSchema.parse({
        id: 'offer-1',
        vacancyId: 'vacancy-1',
        decision: 'pending',
        salaryMin: 150000,
        salaryMax: 100000,
      }),
    ).toThrow()
  })

  it('rejects non-interview pipeline stages for interviews', () => {
    expect(() =>
      interviewSchema.parse({
        id: 'interview-1',
        vacancyId: 'vacancy-1',
        stage: 'offer',
        scheduledAt: '2026-05-20T10:00:00Z',
        result: 'pending',
      }),
    ).toThrow()
  })
})
