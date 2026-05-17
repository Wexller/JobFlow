export const pipelineStageIds = [
  'sourced',
  'applied',
  'recruiter_screen',
  'technical_screen',
  'take_home',
  'onsite',
  'offer',
  'decision',
  'unknown',
] as const

export type PipelineStageId = typeof pipelineStageIds[number]

export const pipelineStageStatusIds = [
  'planned',
  'scheduled',
  'completed',
  'skipped',
  'failed',
  'unknown',
] as const

export type PipelineStageStatusId = typeof pipelineStageStatusIds[number]
