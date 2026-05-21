import type { InterviewResultId, InterviewStageId } from './interviews'
import type { OfferDecisionId } from './offers'
import type { PipelineStageId, PipelineStageStatusId } from './pipeline'
import type { VacancyPriorityId, VacancyStatusId, WorkFormatId } from './vacancies'

export const formStatusIds = [
  'idle',
  'loading',
  'success',
  'error',
] as const

export type FormStatus = typeof formStatusIds[number]

export const defaultFormStatus: FormStatus = 'idle'

export type SyncStatus = FormStatus

export const vacancyFilterAllValue = 'all' as const

export type VacancyFilterSentinel = typeof vacancyFilterAllValue

export const vacancySortKeyIds = [
  'applied_at',
  'match_score',
  'priority',
  'salary',
] as const

export type VacancySortKey = typeof vacancySortKeyIds[number]

export const sortDirectionIds = [
  'asc',
  'desc',
] as const

export type SortDirection = typeof sortDirectionIds[number]

export const defaultVacancySort = {
  direction: 'desc',
  key: 'applied_at',
} as const satisfies { direction: SortDirection, key: VacancySortKey }

export const vacancySortOptionIds = [
  'applied_at:desc',
  'applied_at:asc',
  'priority:desc',
  'match_score:desc',
  'salary:desc',
] as const

export type VacancySortOption = typeof vacancySortOptionIds[number]

export const defaultVacancySortOption: VacancySortOption = 'applied_at:desc'

export const activeVacancyStatusIds = [
  'applied',
  'screening',
  'interviewing',
  'offer',
] as const satisfies readonly VacancyStatusId[]

export const repliedVacancyStatusIds = [
  'screening',
  'interviewing',
  'offer',
  'accepted',
  'rejected',
] as const satisfies readonly VacancyStatusId[]

export const interviewResultsRequiringFollowUp = [
  'pending',
] as const satisfies readonly InterviewResultId[]

export const activeOfferDecisionIds = [
  'pending',
  'accepted',
] as const satisfies readonly OfferDecisionId[]

export const defaultVacancyFormValues = {
  format: 'remote',
  priority: 'medium',
  status: 'wishlist',
} as const satisfies {
  format: WorkFormatId
  priority: VacancyPriorityId
  status: VacancyStatusId
}

export const defaultInterviewFormValues = {
  result: 'pending',
  stage: 'technical_screen',
} as const satisfies {
  result: InterviewResultId
  stage: InterviewStageId
}

export const defaultOfferFormValues = {
  decision: 'pending',
} as const satisfies {
  decision: OfferDecisionId
}

export const defaultPipelineEventFormValues = {
  stage: 'applied',
  status: 'planned',
} as const satisfies {
  stage: PipelineStageId
  status: PipelineStageStatusId
}
