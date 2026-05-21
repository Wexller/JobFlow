import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { addDays, isBefore, parseISO, startOfDay } from 'date-fns'
import {
  activeOfferDecisionIds,
  activeVacancyStatusIds,
  defaultFormStatus,
  defaultVacancySort,
  interviewResultsRequiringFollowUp,
  repliedVacancyStatusIds,
  type SortDirection,
  type SyncStatus,
  type VacancySortKey,
} from '../domain/jobflow'
import { vacancyStatusIds, type VacancyPriorityId, type VacancyStatusId, type WorkFormatId } from '../domain/vacancies'
import type { Interview } from '../schemas/interviews.schema'
import type { Offer } from '../schemas/offers.schema'
import type { PipelineEvent } from '../schemas/pipeline.schema'
import type { JobflowSnapshot, VacancyDetails } from '../schemas/jobflow.schema'
import type { SummaryMetric } from '../schemas/summary-metrics.schema'
import type { Vacancy } from '../schemas/vacancies.schema'
import {
  normalizeInterviewPayload,
  normalizeOfferPayload,
  normalizePipelineEventPayload,
  normalizeVacancyPayload,
} from '../mappers/formPayloads'
import { createJobflowApiRepository } from '../repositories/jobflowApiRepository'
import type { JobflowReadRepository, JobflowWriteRepository } from '../repositories/jobflow'
import { buildVacancyDetails, upsertById } from '../utils/jobflow'

export interface VacancyFilters {
  readonly statuses: VacancyStatusId[]
  readonly sources: string[]
  readonly priorities: VacancyPriorityId[]
  readonly formats: WorkFormatId[]
  readonly levels: string[]
  readonly locations: string[]
  readonly techStack: string[]
  readonly query: string
}

export interface VacancySort {
  readonly key: VacancySortKey
  readonly direction: SortDirection
}

export interface SyncState {
  readonly status: SyncStatus
  readonly lastLoadedAt?: string
  readonly errorMessage?: string
  readonly requestId?: string
}

const defaultFilters = {
  formats: [],
  levels: [],
  locations: [],
  priorities: [],
  query: '',
  sources: [],
  statuses: [],
  techStack: [],
} satisfies VacancyFilters

const priorityRank: Record<VacancyPriorityId, number> = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4,
  unknown: 0,
}

const activeStatuses = new Set<VacancyStatusId>(activeVacancyStatusIds)
const replyRateStatuses = new Set<VacancyStatusId>(repliedVacancyStatusIds)
const followUpInterviewResults = new Set<Interview['result']>(interviewResultsRequiringFollowUp)
const activeOfferDecisions = new Set<Offer['decision']>(activeOfferDecisionIds)

function normalizedText(value: string): string {
  return value.trim().toLocaleLowerCase()
}

function includesAny<T extends string>(selected: readonly T[], value: T | undefined): boolean {
  return selected.length === 0 || (value !== undefined && selected.includes(value))
}

function includesAnyText(selected: readonly string[], value: string | undefined): boolean {
  return selected.length === 0 || (value !== undefined && selected.includes(value))
}

function includesAllText(selected: readonly string[], values: readonly string[]): boolean {
  if (selected.length === 0) {
    return true
  }

  const valueSet = new Set(values.map(normalizedText))
  return selected.every((item) => valueSet.has(normalizedText(item)))
}

function getSortableDate(value: string | undefined): number {
  return value === undefined ? 0 : parseISO(value).getTime()
}

function getSortableSalary(vacancy: Vacancy): number {
  return vacancy.salaryMax ?? vacancy.salaryMin ?? 0
}

function matchesQuery(vacancy: Vacancy, query: string): boolean {
  const normalizedQuery = normalizedText(query)

  if (normalizedQuery.length === 0) {
    return true
  }

  return [
    vacancy.company,
    vacancy.role,
    vacancy.source,
    vacancy.location,
    vacancy.level,
    ...vacancy.techStack,
  ].some((value) => value !== undefined && normalizedText(value).includes(normalizedQuery))
}

function filterVacancies(vacancies: readonly Vacancy[], filters: VacancyFilters): Vacancy[] {
  return vacancies.filter((vacancy) =>
    includesAny(filters.statuses, vacancy.status)
    && includesAny(filters.priorities, vacancy.priority)
    && includesAny(filters.formats, vacancy.format)
    && includesAnyText(filters.sources, vacancy.source)
    && includesAnyText(filters.levels, vacancy.level)
    && includesAnyText(filters.locations, vacancy.location)
    && includesAllText(filters.techStack, vacancy.techStack)
    && matchesQuery(vacancy, filters.query),
  )
}

function sortVacancies(vacancies: readonly Vacancy[], sort: VacancySort): Vacancy[] {
  const multiplier = sort.direction === 'asc' ? 1 : -1

  return [...vacancies].sort((first, second) => {
    let result = 0

    if (sort.key === 'applied_at') {
      result = getSortableDate(first.appliedAt) - getSortableDate(second.appliedAt)
    }

    if (sort.key === 'match_score') {
      result = (first.matchScore ?? 0) - (second.matchScore ?? 0)
    }

    if (sort.key === 'priority') {
      result = priorityRank[first.priority] - priorityRank[second.priority]
    }

    if (sort.key === 'salary') {
      result = getSortableSalary(first) - getSortableSalary(second)
    }

    if (result === 0) {
      result = first.company.localeCompare(second.company)
    }

    return result * multiplier
  })
}

function isWithinUpcomingWindow(value: string, referenceDateIso: string, days: number): boolean {
  const start = startOfDay(parseISO(referenceDateIso))
  const end = addDays(start, days)
  const date = parseISO(value)

  return !isBefore(date, start) && isBefore(date, end)
}

export const useJobflowStore = defineStore('jobflow', () => {
  const filters = ref<VacancyFilters>({ ...defaultFilters })
  const interviews = ref<Interview[]>([])
  const offers = ref<Offer[]>([])
  const pipelineEvents = ref<PipelineEvent[]>([])
  const referenceDateIso = ref(new Date().toISOString())
  const sort = ref<VacancySort>({ ...defaultVacancySort })
  const sync = ref<SyncState>({
    status: defaultFormStatus,
  })
  const vacancies = ref<Vacancy[]>([])

  const activeVacancies = computed(() =>
    vacancies.value.filter((vacancy) => activeStatuses.has(vacancy.status)),
  )

  const dashboardMetrics = computed<SummaryMetric[]>(() => {
    const totalApplications = vacancies.value.filter((vacancy) => vacancy.appliedAt !== undefined).length
    const activeProcesses = vacancies.value.filter((vacancy) => activeStatuses.has(vacancy.status)).length
    const interviewsThisWeek = interviews.value.filter((interview) =>
      followUpInterviewResults.has(interview.result) && isWithinUpcomingWindow(interview.scheduledAt, referenceDateIso.value, 7),
    ).length
    const activeOffers = offers.value.filter((offer) => activeOfferDecisions.has(offer.decision)).length
    const replied = vacancies.value.filter((vacancy) =>
      replyRateStatuses.has(vacancy.status),
    ).length
    const interviewed = vacancies.value.filter((vacancy) =>
      interviews.value.some((interview) => interview.vacancyId === vacancy.id),
    ).length
    const nextActions = vacancies.value.filter((vacancy) =>
      vacancy.nextActionAt !== undefined
      && !isBefore(parseISO(vacancy.nextActionAt), startOfDay(parseISO(referenceDateIso.value))),
    ).length
    const rate = (value: number) => totalApplications === 0 ? 0 : Math.round((value / totalApplications) * 1000) / 10

    return [
      { id: 'total_applications', value: totalApplications },
      { id: 'active_processes', value: activeProcesses },
      { id: 'interviews_this_week', value: interviewsThisWeek },
      { id: 'offers', value: activeOffers },
      { id: 'reply_rate', value: rate(replied), rate: rate(replied) },
      { id: 'interview_rate', value: rate(interviewed), rate: rate(interviewed) },
      { id: 'offer_rate', value: rate(activeOffers), rate: rate(activeOffers) },
      { id: 'next_actions', value: nextActions },
    ]
  })

  const filteredVacancies = computed<Vacancy[]>(() =>
    sortVacancies(filterVacancies(vacancies.value, filters.value), sort.value),
  )

  const kanbanGroups = computed<Record<VacancyStatusId, Vacancy[]>>(() => {
    const groups = vacancyStatusIds.reduce<Record<VacancyStatusId, Vacancy[]>>((accumulator, status) => {
      accumulator[status] = []
      return accumulator
    }, {
      accepted: [],
      applied: [],
      archived: [],
      interviewing: [],
      offer: [],
      rejected: [],
      screening: [],
      unknown: [],
      wishlist: [],
    })

    for (const vacancy of vacancies.value) {
      groups[vacancy.status].push(vacancy)
    }

    for (const status of vacancyStatusIds) {
      groups[status] = sortVacancies(groups[status], sort.value)
    }

    return groups
  })

  function applySnapshot(snapshot: JobflowSnapshot) {
    vacancies.value = snapshot.vacancies
    pipelineEvents.value = snapshot.pipelineEvents
    interviews.value = snapshot.interviews
    offers.value = snapshot.offers
    sync.value = {
      lastLoadedAt: new Date().toISOString(),
      status: 'success',
    }
  }

  async function load(repository?: JobflowReadRepository) {
    const activeRepository = repository ?? createJobflowApiRepository()
    sync.value = { status: 'loading' }

    const result = await activeRepository.getSnapshot()

    if (!result.ok) {
      sync.value = {
        errorMessage: result.error.message,
        status: 'error',
      }
      return result
    }

    applySnapshot(result.value)
    return result
  }

  function setLoadError(errorMessage: string, requestId?: string) {
    sync.value = {
      errorMessage,
      requestId,
      status: 'error',
    }
  }

  function setLoading() {
    sync.value = { status: 'loading' }
  }

  function resetFilters() {
    filters.value = { ...defaultFilters }
  }

  function setFilters(updatedFilters: Partial<VacancyFilters>) {
    filters.value = {
      ...filters.value,
      ...updatedFilters,
    }
  }

  function setReferenceDate(nextReferenceDateIso: string) {
    referenceDateIso.value = nextReferenceDateIso
  }

  function setSort(nextSort: VacancySort) {
    sort.value = nextSort
  }

  async function saveVacancy(payload: unknown, repository?: JobflowWriteRepository) {
      const normalized = normalizeVacancyPayload(payload)

      if (!normalized.ok) {
        return normalized
      }

      const activeRepository = repository ?? createJobflowApiRepository()
      const exists = vacancies.value.some((vacancy) => vacancy.id === normalized.value.id)
      const result = exists
        ? await activeRepository.updateVacancy(normalized.value.id, normalized.value)
        : await activeRepository.createVacancy(normalized.value)

      if (!result.ok) {
        return result
      }

      vacancies.value = upsertById(vacancies.value, result.value)
      return result
  }

  async function savePipelineEvent(payload: unknown, repository?: JobflowWriteRepository) {
      const normalized = normalizePipelineEventPayload(payload)

      if (!normalized.ok) {
        return normalized
      }

      const activeRepository = repository ?? createJobflowApiRepository()
      const exists = pipelineEvents.value.some((pipelineEvent) => pipelineEvent.id === normalized.value.id)
      const result = exists
        ? await activeRepository.updatePipelineEvent(normalized.value.id, normalized.value)
        : await activeRepository.createPipelineEvent(normalized.value)

      if (!result.ok) {
        return result
      }

      pipelineEvents.value = upsertById(pipelineEvents.value, result.value)
      return result
  }

  async function saveInterview(payload: unknown, repository?: JobflowWriteRepository) {
      const normalized = normalizeInterviewPayload(payload)

      if (!normalized.ok) {
        return normalized
      }

      const activeRepository = repository ?? createJobflowApiRepository()
      const exists = interviews.value.some((interview) => interview.id === normalized.value.id)
      const result = exists
        ? await activeRepository.updateInterview(normalized.value.id, normalized.value)
        : await activeRepository.createInterview(normalized.value)

      if (!result.ok) {
        return result
      }

      interviews.value = upsertById(interviews.value, result.value)
      return result
  }

  async function saveOffer(payload: unknown, repository?: JobflowWriteRepository) {
      const normalized = normalizeOfferPayload(payload)

      if (!normalized.ok) {
        return normalized
      }

      const activeRepository = repository ?? createJobflowApiRepository()
      const existingOffer = offers.value.find((offer) => offer.id === normalized.value.id)
      const result = existingOffer === undefined
        ? await activeRepository.createOffer(normalized.value)
        : await activeRepository.updateOffer(normalized.value.id, normalized.value)

      if (!result.ok) {
        return result
      }

      offers.value = upsertById(offers.value, result.value)
      return result
  }

  function applyPipelineEvent(pipelineEvent: PipelineEvent) {
    pipelineEvents.value = upsertById(pipelineEvents.value, pipelineEvent)
  }

  function applyInterview(interview: Interview) {
    interviews.value = upsertById(interviews.value, interview)
  }

  function applyOffer(offer: Offer) {
    offers.value = upsertById(offers.value, offer)
  }

  function vacancyDetails(vacancyId: string): VacancyDetails | undefined {
    return buildVacancyDetails({
      interviews: interviews.value,
      offers: offers.value,
      pipelineEvents: pipelineEvents.value,
      vacancies: vacancies.value,
    }, vacancyId)
  }

  return {
    activeVacancies,
    applyInterview,
    applyOffer,
    applyPipelineEvent,
    applySnapshot,
    dashboardMetrics,
    filteredVacancies,
    filters,
    interviews,
    kanbanGroups,
    load,
    offers,
    pipelineEvents,
    referenceDateIso,
    resetFilters,
    saveInterview,
    saveOffer,
    savePipelineEvent,
    saveVacancy,
    setFilters,
    setLoadError,
    setLoading,
    setReferenceDate,
    setSort,
    sort,
    sync,
    vacancies,
    vacancyDetails,
  }
})
