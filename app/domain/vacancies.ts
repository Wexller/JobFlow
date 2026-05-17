export const vacancyStatusIds = [
  'wishlist',
  'applied',
  'screening',
  'interviewing',
  'offer',
  'accepted',
  'rejected',
  'archived',
  'unknown',
] as const

export type VacancyStatusId = typeof vacancyStatusIds[number]

export const vacancyPriorityIds = [
  'low',
  'medium',
  'high',
  'urgent',
  'unknown',
] as const

export type VacancyPriorityId = typeof vacancyPriorityIds[number]

export const workFormatIds = [
  'remote',
  'hybrid',
  'onsite',
  'unknown',
] as const

export type WorkFormatId = typeof workFormatIds[number]
