export const summaryMetricIds = [
  'total_applications',
  'active_processes',
  'interviews_this_week',
  'offers',
  'reply_rate',
  'interview_rate',
  'offer_rate',
  'next_actions',
  'unknown',
] as const

export type SummaryMetricId = typeof summaryMetricIds[number]
