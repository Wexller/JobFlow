import type { Interview } from '../schemas/interviews.schema'
import { interviewSchema } from '../schemas/interviews.schema'
import type { Offer } from '../schemas/offers.schema'
import { offerSchema } from '../schemas/offers.schema'
import type { PipelineEvent } from '../schemas/pipeline.schema'
import { pipelineEventSchema } from '../schemas/pipeline.schema'
import type { SummaryMetric } from '../schemas/summary-metrics.schema'
import { summaryMetricSchema } from '../schemas/summary-metrics.schema'
import type { Vacancy } from '../schemas/vacancies.schema'
import { vacancySchema } from '../schemas/vacancies.schema'
import type { Result } from '../utils/result'
import { createAppError, err, ok } from '../utils/result'

type FormRecord = Record<string, unknown>

function isRecord(payload: unknown): payload is FormRecord {
  return typeof payload === 'object' && payload !== null && !Array.isArray(payload)
}

function text(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined
  }

  const normalized = String(value).trim()
  return normalized.length > 0 ? normalized : undefined
}

function requiredText(value: unknown): string {
  return text(value) ?? ''
}

function numberValue(value: unknown): number | undefined {
  if (value === undefined || value === null) {
    return undefined
  }

  if (typeof value === 'string' && value.trim() === '') {
    return undefined
  }

  const parsed = typeof value === 'number' ? value : Number(String(value).trim())
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function stringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(text).filter((item): item is string => item !== undefined)
  }

  const normalized = text(value)

  if (normalized === undefined) {
    return []
  }

  return normalized
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function parsePayload<T>(schema: { safeParse: (payload: unknown) => { success: true, data: T } | { success: false, error: unknown } }, payload: unknown): Result<T> {
  const parsed = schema.safeParse(payload)

  if (parsed.success) {
    return ok(parsed.data)
  }

  return err(createAppError('validation', 'Invalid form payload', {
    cause: parsed.error,
  }))
}

function asRecordResult(payload: unknown): Result<FormRecord> {
  if (isRecord(payload)) {
    return ok(payload)
  }

  return err(createAppError('validation', 'Expected a form payload object'))
}

export function normalizeVacancyPayload(payload: unknown): Result<Vacancy> {
  const recordResult = asRecordResult(payload)

  if (!recordResult.ok) {
    return recordResult
  }

  const record = recordResult.value

  return parsePayload(vacancySchema, {
    id: requiredText(record.id),
    company: requiredText(record.company),
    role: requiredText(record.role),
    status: requiredText(record.status),
    priority: requiredText(record.priority),
    format: requiredText(record.format),
    source: text(record.source),
    location: text(record.location),
    level: text(record.level),
    techStack: stringList(record.techStack),
    salaryMin: numberValue(record.salaryMin),
    salaryMax: numberValue(record.salaryMax),
    currency: text(record.currency),
    matchScore: numberValue(record.matchScore),
    appliedAt: text(record.appliedAt),
    nextActionAt: text(record.nextActionAt),
    createdAt: requiredText(record.createdAt),
    updatedAt: requiredText(record.updatedAt),
    archivedAt: text(record.archivedAt),
    notes: text(record.notes),
  })
}

export function normalizePipelineEventPayload(payload: unknown): Result<PipelineEvent> {
  const recordResult = asRecordResult(payload)

  if (!recordResult.ok) {
    return recordResult
  }

  const record = recordResult.value

  return parsePayload(pipelineEventSchema, {
    id: requiredText(record.id),
    vacancyId: requiredText(record.vacancyId),
    stage: requiredText(record.stage),
    status: requiredText(record.status),
    title: text(record.title),
    occurredAt: text(record.occurredAt),
    scheduledAt: text(record.scheduledAt),
    completedAt: text(record.completedAt),
    notes: text(record.notes),
  })
}

export function normalizeInterviewPayload(payload: unknown): Result<Interview> {
  const recordResult = asRecordResult(payload)

  if (!recordResult.ok) {
    return recordResult
  }

  const record = recordResult.value

  return parsePayload(interviewSchema, {
    id: requiredText(record.id),
    vacancyId: requiredText(record.vacancyId),
    pipelineEventId: text(record.pipelineEventId),
    stage: requiredText(record.stage),
    scheduledAt: requiredText(record.scheduledAt),
    result: requiredText(record.result),
    interviewerNames: stringList(record.interviewerNames),
    location: text(record.location),
    notes: text(record.notes),
  })
}

export function normalizeOfferPayload(payload: unknown): Result<Offer> {
  const recordResult = asRecordResult(payload)

  if (!recordResult.ok) {
    return recordResult
  }

  const record = recordResult.value

  return parsePayload(offerSchema, {
    id: requiredText(record.id),
    vacancyId: requiredText(record.vacancyId),
    decision: requiredText(record.decision),
    offeredAt: text(record.offeredAt),
    decisionDueAt: text(record.decisionDueAt),
    salaryMin: numberValue(record.salaryMin),
    salaryMax: numberValue(record.salaryMax),
    currency: text(record.currency),
    notes: text(record.notes),
  })
}

export function normalizeSummaryMetricPayload(payload: unknown): Result<SummaryMetric> {
  const recordResult = asRecordResult(payload)

  if (!recordResult.ok) {
    return recordResult
  }

  const record = recordResult.value

  return parsePayload(summaryMetricSchema, {
    id: requiredText(record.id),
    value: numberValue(record.value),
    rate: numberValue(record.rate),
    trend: text(record.trend),
  })
}
