import { defineStore } from 'pinia'
import { addDays, compareAsc, isBefore, parseISO, startOfDay } from 'date-fns'
import { vacancyStatusIds, type VacancyPriorityId, type VacancyStatusId, type WorkFormatId } from '../domain/vacancies'
import type { Interview } from '../schemas/interviews.schema'
import type { Offer } from '../schemas/offers.schema'
import type { PipelineEvent } from '../schemas/pipeline.schema'
import type { SummaryMetric } from '../schemas/summary-metrics.schema'
import type { Vacancy } from '../schemas/vacancies.schema'
import { normalizeVacancyPayload } from '../mappers/formPayloads'
import { createMockRepository, type JobflowRepository } from '../repositories/mockRepository'

export type VacancySortKey = 'applied_at' | 'match_score' | 'priority' | 'salary'
export type SortDirection = 'asc' | 'desc'

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
  readonly status: 'idle' | 'loading' | 'success' | 'error'
  readonly lastLoadedAt?: string
  readonly errorMessage?: string
}

export interface VacancyDetails {
  readonly vacancy: Vacancy
  readonly pipelineEvents: PipelineEvent[]
  readonly interviews: Interview[]
  readonly offer?: Offer
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

const activeStatuses = new Set<VacancyStatusId>(['applied', 'screening', 'interviewing', 'offer'])

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

function sortEventsByDate<T extends { scheduledAt?: string, occurredAt?: string, completedAt?: string }>(items: readonly T[]): T[] {
  return [...items].sort((first, second) => {
    const firstDate = first.scheduledAt ?? first.occurredAt ?? first.completedAt ?? ''
    const secondDate = second.scheduledAt ?? second.occurredAt ?? second.completedAt ?? ''

    if (firstDate.length === 0 || secondDate.length === 0) {
      return firstDate.localeCompare(secondDate)
    }

    return compareAsc(parseISO(firstDate), parseISO(secondDate))
  })
}

export const useJobflowStore = defineStore('jobflow', {
  state: () => ({
    filters: { ...defaultFilters } as VacancyFilters,
    interviews: [] as Interview[],
    offers: [] as Offer[],
    pipelineEvents: [] as PipelineEvent[],
    referenceDateIso: new Date().toISOString(),
    sort: {
      direction: 'desc',
      key: 'applied_at',
    } as VacancySort,
    sync: {
      status: 'idle',
    } as SyncState,
    vacancies: [] as Vacancy[],
  }),
  getters: {
    activeVacancies: (state) => state.vacancies.filter((vacancy) => activeStatuses.has(vacancy.status)),
    dashboardMetrics(state): SummaryMetric[] {
      const totalApplications = state.vacancies.filter((vacancy) => vacancy.appliedAt !== undefined).length
      const activeProcesses = state.vacancies.filter((vacancy) => activeStatuses.has(vacancy.status)).length
      const interviewsThisWeek = state.interviews.filter((interview) =>
        interview.result === 'pending' && isWithinUpcomingWindow(interview.scheduledAt, state.referenceDateIso, 7),
      ).length
      const offers = state.offers.filter((offer) => offer.decision === 'pending' || offer.decision === 'accepted').length
      const replied = state.vacancies.filter((vacancy) =>
        ['screening', 'interviewing', 'offer', 'accepted', 'rejected'].includes(vacancy.status),
      ).length
      const interviewed = state.vacancies.filter((vacancy) =>
        state.interviews.some((interview) => interview.vacancyId === vacancy.id),
      ).length
      const nextActions = state.vacancies.filter((vacancy) =>
        vacancy.nextActionAt !== undefined
        && !isBefore(parseISO(vacancy.nextActionAt), startOfDay(parseISO(state.referenceDateIso))),
      ).length
      const rate = (value: number) => totalApplications === 0 ? 0 : Math.round((value / totalApplications) * 1000) / 10

      return [
        { id: 'total_applications', value: totalApplications },
        { id: 'active_processes', value: activeProcesses },
        { id: 'interviews_this_week', value: interviewsThisWeek },
        { id: 'offers', value: offers },
        { id: 'reply_rate', value: rate(replied), rate: rate(replied) },
        { id: 'interview_rate', value: rate(interviewed), rate: rate(interviewed) },
        { id: 'offer_rate', value: rate(offers), rate: rate(offers) },
        { id: 'next_actions', value: nextActions },
      ]
    },
    filteredVacancies(state): Vacancy[] {
      return sortVacancies(filterVacancies(state.vacancies, state.filters), state.sort)
    },
    kanbanGroups(state): Record<VacancyStatusId, Vacancy[]> {
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

      for (const vacancy of state.vacancies) {
        groups[vacancy.status].push(vacancy)
      }

      for (const status of vacancyStatusIds) {
        groups[status] = sortVacancies(groups[status], state.sort)
      }

      return groups
    },
  },
  actions: {
    async load(repository: JobflowRepository = createMockRepository()) {
      this.sync = { status: 'loading' }

      const result = await repository.getSnapshot()

      if (!result.ok) {
        this.sync = {
          errorMessage: result.error.message,
          status: 'error',
        }
        return result
      }

      this.vacancies = result.value.vacancies
      this.pipelineEvents = result.value.pipelineEvents
      this.interviews = result.value.interviews
      this.offers = result.value.offers
      this.sync = {
        lastLoadedAt: new Date().toISOString(),
        status: 'success',
      }

      return result
    },
    resetFilters() {
      this.filters = { ...defaultFilters }
    },
    setFilters(filters: Partial<VacancyFilters>) {
      this.filters = {
        ...this.filters,
        ...filters,
      }
    },
    setReferenceDate(referenceDateIso: string) {
      this.referenceDateIso = referenceDateIso
    },
    setSort(sort: VacancySort) {
      this.sort = sort
    },
    saveVacancy(payload: unknown) {
      const result = normalizeVacancyPayload(payload)

      if (!result.ok) {
        return result
      }

      const index = this.vacancies.findIndex((vacancy) => vacancy.id === result.value.id)

      if (index === -1) {
        this.vacancies = [...this.vacancies, result.value]
      }
      else {
        this.vacancies = this.vacancies.map((vacancy) => vacancy.id === result.value.id ? result.value : vacancy)
      }

      return result
    },
    vacancyDetails(vacancyId: string): VacancyDetails | undefined {
      const vacancy = this.vacancies.find((item) => item.id === vacancyId)

      if (vacancy === undefined) {
        return undefined
      }

      return {
        interviews: sortEventsByDate(this.interviews.filter((interview) => interview.vacancyId === vacancyId)),
        offer: this.offers.find((offer) => offer.vacancyId === vacancyId),
        pipelineEvents: sortEventsByDate(this.pipelineEvents.filter((event) => event.vacancyId === vacancyId)),
        vacancy,
      }
    },
  },
})
