import { describe, expect, it } from 'vitest'
import {
  normalizeInterviewPayload,
  normalizeOfferPayload,
  normalizePipelineEventPayload,
  normalizeSummaryMetricPayload,
  normalizeVacancyPayload,
} from '../../app/mappers/formPayloads'

const validPayloads = {
  vacancy: {
    id: 'vacancy-1',
    company: 'Acme',
    role: 'Frontend Engineer',
    status: 'applied',
    priority: 'high',
    format: 'remote',
    createdAt: '2026-05-01T09:00:00Z',
    updatedAt: '2026-05-12T09:30:00Z',
  },
  pipelineEvent: {
    id: 'pipeline-1',
    vacancyId: 'vacancy-1',
    stage: 'technical_screen',
    status: 'scheduled',
  },
  interview: {
    id: 'interview-1',
    vacancyId: 'vacancy-1',
    stage: 'technical_screen',
    scheduledAt: '2026-05-20T10:00:00Z',
    result: 'pending',
  },
  offer: {
    id: 'offer-1',
    vacancyId: 'vacancy-1',
    decision: 'pending',
  },
  summaryMetric: {
    id: 'reply_rate',
    value: '42',
  },
}

const mapperCases = [
  {
    invalidPayload: { ...validPayloads.vacancy, status: 'Отклик отправлен' },
    mapper: normalizeVacancyPayload,
    name: 'vacancy',
  },
  {
    invalidPayload: { ...validPayloads.pipelineEvent, stage: 'Техническое интервью' },
    mapper: normalizePipelineEventPayload,
    name: 'pipeline event',
  },
  {
    invalidPayload: { ...validPayloads.interview, result: 'Пройдено' },
    mapper: normalizeInterviewPayload,
    name: 'interview',
  },
  {
    invalidPayload: { ...validPayloads.offer, decision: 'Принять' },
    mapper: normalizeOfferPayload,
    name: 'offer',
  },
  {
    invalidPayload: { ...validPayloads.summaryMetric, id: 'Процент ответов' },
    mapper: normalizeSummaryMetricPayload,
    name: 'summary metric',
  },
] as const

describe('form payload mappers', () => {
  it('normalizes vacancy form values into a typed domain object', () => {
    const result = normalizeVacancyPayload({
      id: ' vacancy-1 ',
      company: ' Acme ',
      role: ' Frontend Engineer ',
      status: 'applied',
      priority: 'high',
      format: 'remote',
      source: '',
      techStack: ' Vue, TypeScript, , Nuxt ',
      salaryMin: '100000',
      salaryMax: '150000',
      matchScore: '86',
      appliedAt: '2026-05-10',
      createdAt: '2026-05-01T09:00:00Z',
      updatedAt: '2026-05-12T09:30:00Z',
    })

    expect(result).toMatchObject({
      ok: true,
      value: {
        id: 'vacancy-1',
        company: 'Acme',
        techStack: ['Vue', 'TypeScript', 'Nuxt'],
        salaryMin: 100000,
        salaryMax: 150000,
        matchScore: 86,
      },
    })
  })

  it('normalizes pipeline, interview, offer, and metric payloads', () => {
    expect(normalizePipelineEventPayload({
      id: ' pipeline-1 ',
      vacancyId: ' vacancy-1 ',
      stage: 'technical_screen',
      status: 'scheduled',
      title: ' Technical screen ',
      scheduledAt: '2026-05-20T10:00:00Z',
    })).toMatchObject({
      ok: true,
      value: {
        id: 'pipeline-1',
        title: 'Technical screen',
      },
    })

    expect(normalizeInterviewPayload({
      id: 'interview-1',
      vacancyId: 'vacancy-1',
      stage: 'technical_screen',
      scheduledAt: '2026-05-20T10:00:00Z',
      result: 'pending',
      interviewerNames: ' Ada, Grace ',
    })).toMatchObject({
      ok: true,
      value: {
        interviewerNames: ['Ada', 'Grace'],
      },
    })

    expect(normalizeOfferPayload({
      id: 'offer-1',
      vacancyId: 'vacancy-1',
      decision: 'pending',
      salaryMin: '100000',
      salaryMax: '150000',
      currency: ' USD ',
    })).toMatchObject({
      ok: true,
      value: {
        currency: 'USD',
        salaryMax: 150000,
      },
    })

    expect(normalizeSummaryMetricPayload({
      id: 'reply_rate',
      value: '42',
      rate: '18.5',
      trend: 'up',
    })).toMatchObject({
      ok: true,
      value: {
        rate: 18.5,
      },
    })
  })

  it.each(mapperCases)('returns validation errors for invalid $name payloads', ({ invalidPayload, mapper }) => {
    expect(mapper(invalidPayload)).toMatchObject({
      ok: false,
      error: {
        code: 'validation',
      },
    })
  })

  it.each(mapperCases)('rejects non-object payloads for $name mappers', ({ mapper }) => {
    expect(mapper(null)).toMatchObject({
      ok: false,
      error: {
        code: 'validation',
      },
    })
  })

  it('normalizes whitespace-only optional numeric fields to undefined', () => {
    const result = normalizeVacancyPayload({
      ...validPayloads.vacancy,
      matchScore: '   ',
      salaryMax: '   ',
      salaryMin: '   ',
    })

    expect(result).toMatchObject({
      ok: true,
      value: {
        matchScore: undefined,
        salaryMax: undefined,
        salaryMin: undefined,
      },
    })
  })

  it('returns validation errors for whitespace-only required numeric fields', () => {
    expect(normalizeSummaryMetricPayload({
      id: 'reply_rate',
      value: '   ',
    })).toMatchObject({
      ok: false,
      error: {
        code: 'validation',
      },
    })
  })
})
