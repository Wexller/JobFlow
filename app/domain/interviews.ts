export const interviewStageIds = [
  'recruiter_screen',
  'technical_screen',
  'take_home',
  'onsite',
  'unknown',
] as const

export type InterviewStageId = typeof interviewStageIds[number]

export const interviewResultIds = [
  'pending',
  'passed',
  'failed',
  'cancelled',
  'no_show',
  'unknown',
] as const

export type InterviewResultId = typeof interviewResultIds[number]
