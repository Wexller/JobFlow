import { z } from 'zod'
import { interviewSchema } from './interviews.schema'
import { offerSchema } from './offers.schema'
import { pipelineEventSchema } from './pipeline.schema'
import { vacancySchema } from './vacancies.schema'

export const jobflowSnapshotSchema = z.object({
  interviews: z.array(interviewSchema),
  offers: z.array(offerSchema),
  pipelineEvents: z.array(pipelineEventSchema),
  vacancies: z.array(vacancySchema),
})

export const vacancyDetailsSchema = z.object({
  interviews: z.array(interviewSchema),
  offer: offerSchema.optional(),
  pipelineEvents: z.array(pipelineEventSchema),
  vacancy: vacancySchema,
})

export type JobflowSnapshot = z.infer<typeof jobflowSnapshotSchema>
export type VacancyDetails = z.infer<typeof vacancyDetailsSchema>
