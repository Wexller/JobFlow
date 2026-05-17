import { z } from 'zod'
import { pipelineStageIds, pipelineStageStatusIds } from '../domain/pipeline'
import { entityIdSchema, isoDateSchema, optionalTextSchema } from './common.schema'

export const pipelineStageSchema = z.enum(pipelineStageIds)
export const pipelineStageStatusSchema = z.enum(pipelineStageStatusIds)

export const pipelineEventSchema = z.object({
  id: entityIdSchema,
  vacancyId: entityIdSchema,
  stage: pipelineStageSchema,
  status: pipelineStageStatusSchema,
  title: optionalTextSchema,
  occurredAt: isoDateSchema.optional(),
  scheduledAt: isoDateSchema.optional(),
  completedAt: isoDateSchema.optional(),
  notes: optionalTextSchema,
})

export type PipelineEvent = z.infer<typeof pipelineEventSchema>
