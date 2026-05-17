import { z } from 'zod'
import { summaryMetricIds } from '../domain/summary-metrics'
import { percentageSchema } from './common.schema'

export const summaryMetricIdSchema = z.enum(summaryMetricIds)

export const summaryMetricSchema = z.object({
  id: summaryMetricIdSchema,
  value: z.number().finite(),
  rate: percentageSchema.optional(),
  trend: z.enum(['up', 'down', 'flat', 'unknown']).optional(),
})

export type SummaryMetric = z.infer<typeof summaryMetricSchema>
