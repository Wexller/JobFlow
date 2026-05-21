import { interviewResultIds, interviewStageIds } from '../../app/domain/interviews'
import { offerDecisionIds } from '../../app/domain/offers'
import { pipelineStageIds, pipelineStageStatusIds } from '../../app/domain/pipeline'
import { vacancyPriorityIds, vacancyStatusIds, workFormatIds } from '../../app/domain/vacancies'
import { normalizeInterviewPayload, normalizeOfferPayload, normalizePipelineEventPayload, normalizeVacancyPayload } from '../../app/mappers/formPayloads'
import type { JobflowService } from './jobflowService'

export interface OperatorBundleDraft {
  assumptions: string[]
  interviews: Record<string, unknown>[]
  offer: Record<string, unknown> | null
  pipelineEvents: Record<string, unknown>[]
  vacancy: Record<string, unknown>
  warnings: string[]
}

export function previewOperatorBundle(source: string): OperatorBundleDraft {
  const warnings: string[] = []
  const assumptions: string[] = []
  const now = new Date().toISOString()
  const lines = source.split('\n').map((line) => line.trim()).filter(Boolean)
  const findText = (label: string) => lines.find((line) => line.toLowerCase().startsWith(`${label.toLowerCase()}:`))?.split(':').slice(1).join(':').trim()
  const findEnum = (label: string, allowed: readonly string[], fallback: string, warning: string) => {
    const value = findText(label)?.toLowerCase()
    if (value && allowed.includes(value)) {
      return value
    }
    warnings.push(warning)
    assumptions.push(`${label}=${fallback}`)
    return fallback
  }

  const vacancy = {
    appliedAt: findText('appliedAt') ?? now,
    company: findText('company') ?? '',
    contactEmail: findText('contactEmail') ?? '',
    contactName: findText('contactName') ?? '',
    format: findEnum('format', workFormatIds, 'unknown', 'format is missing or ambiguous'),
    level: findText('level') ?? '',
    location: findText('location') ?? '',
    notes: findText('notes') ?? '',
    priority: findEnum('priority', vacancyPriorityIds, 'medium', 'priority is missing or ambiguous'),
    role: findText('role') ?? '',
    salaryCurrency: findText('salaryCurrency') ?? '',
    salaryMax: Number(findText('salaryMax') ?? 0) || 0,
    salaryMin: Number(findText('salaryMin') ?? 0) || 0,
    source: findText('source') ?? '',
    status: findEnum('status', vacancyStatusIds, 'applied', 'status is missing or ambiguous'),
    techStack: (findText('techStack') ?? '').split(',').map((item) => item.trim()).filter(Boolean),
  }

  if (!vacancy.company || !vacancy.role) {
    warnings.push('company and role are required for safe vacancy creation')
  }

  return {
    assumptions,
    interviews: [],
    offer: null,
    pipelineEvents: [],
    vacancy,
    warnings,
  }
}

export async function commitOperatorBundle(service: JobflowService, bundle: OperatorBundleDraft) {
  const vacancy = normalizeVacancyPayload(bundle.vacancy)
  if (!vacancy.ok) {
    return vacancy
  }

  const createdVacancy = await service.createVacancy(vacancy.value)
  if (!createdVacancy.ok) {
    return createdVacancy
  }

  for (const event of bundle.pipelineEvents) {
    const parsed = normalizePipelineEventPayload({ ...event, vacancyId: createdVacancy.value.id, stage: event.stage ?? pipelineStageIds[0], status: event.status ?? pipelineStageStatusIds[0] })
    if (!parsed.ok) return parsed
    const saved = await service.createPipelineEvent(parsed.value)
    if (!saved.ok) return saved
  }
  for (const interview of bundle.interviews) {
    const parsed = normalizeInterviewPayload({ ...interview, vacancyId: createdVacancy.value.id, result: interview.result ?? interviewResultIds[0], stage: interview.stage ?? interviewStageIds[0] })
    if (!parsed.ok) return parsed
    const saved = await service.createInterview(parsed.value)
    if (!saved.ok) return saved
  }
  if (bundle.offer) {
    const parsed = normalizeOfferPayload({ ...bundle.offer, vacancyId: createdVacancy.value.id, decision: bundle.offer.decision ?? offerDecisionIds[0] })
    if (!parsed.ok) return parsed
    const saved = await service.createOffer(parsed.value)
    if (!saved.ok) return saved
  }

  return createdVacancy
}
