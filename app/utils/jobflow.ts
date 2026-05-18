import { compareAsc, parseISO } from 'date-fns'
import type { JobflowSnapshot, VacancyDetails } from '../schemas/jobflow.schema'

export function sortJobflowItemsByDate<T extends { scheduledAt?: string, occurredAt?: string, completedAt?: string }>(items: readonly T[]): T[] {
  return [...items].sort((first, second) => {
    const firstDate = first.scheduledAt ?? first.occurredAt ?? first.completedAt ?? ''
    const secondDate = second.scheduledAt ?? second.occurredAt ?? second.completedAt ?? ''

    if (firstDate.length === 0 || secondDate.length === 0) {
      return firstDate.localeCompare(secondDate)
    }

    return compareAsc(parseISO(firstDate), parseISO(secondDate))
  })
}

export function buildVacancyDetails(snapshot: JobflowSnapshot, vacancyId: string): VacancyDetails | undefined {
  const vacancy = snapshot.vacancies.find((item) => item.id === vacancyId)

  if (vacancy === undefined) {
    return undefined
  }

  return {
    interviews: sortJobflowItemsByDate(snapshot.interviews.filter((interview) => interview.vacancyId === vacancyId)),
    offer: snapshot.offers.find((offer) => offer.vacancyId === vacancyId),
    pipelineEvents: sortJobflowItemsByDate(snapshot.pipelineEvents.filter((event) => event.vacancyId === vacancyId)),
    vacancy,
  }
}

export function upsertById<T extends { id: string }>(items: readonly T[], item: T): T[] {
  const index = items.findIndex((existingItem) => existingItem.id === item.id)

  if (index === -1) {
    return [...items, item]
  }

  return items.map((existingItem) => existingItem.id === item.id ? item : existingItem)
}
