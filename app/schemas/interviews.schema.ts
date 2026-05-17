import { z } from 'zod'
import { interviewResultIds, interviewStageIds } from '../domain/interviews'
import { entityIdSchema, isoDateSchema, optionalTextSchema } from './common.schema'

export const interviewResultSchema = z.enum(interviewResultIds)
export const interviewStageSchema = z.enum(interviewStageIds)

export const interviewSchema = z.object({
  id: entityIdSchema,
  vacancyId: entityIdSchema,
  pipelineEventId: entityIdSchema.optional(),
  stage: interviewStageSchema,
  scheduledAt: isoDateSchema,
  result: interviewResultSchema,
  interviewerNames: z.array(z.string().trim().min(1)).default([]),
  location: optionalTextSchema,
  notes: optionalTextSchema,
})

export type Interview = z.infer<typeof interviewSchema>
