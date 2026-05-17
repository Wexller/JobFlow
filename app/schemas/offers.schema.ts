import { z } from 'zod'
import { offerDecisionIds } from '../domain/offers'
import {
  entityIdSchema,
  isValidMoneyRange,
  isoDateSchema,
  moneyAmountSchema,
  optionalTextSchema,
} from './common.schema'

export const offerDecisionSchema = z.enum(offerDecisionIds)

export const offerSchema = z.object({
  id: entityIdSchema,
  vacancyId: entityIdSchema,
  decision: offerDecisionSchema,
  offeredAt: isoDateSchema.optional(),
  decisionDueAt: isoDateSchema.optional(),
  salaryMin: moneyAmountSchema.optional(),
  salaryMax: moneyAmountSchema.optional(),
  currency: optionalTextSchema,
  notes: optionalTextSchema,
}).refine(isValidMoneyRange, {
  message: 'salaryMax must be greater than or equal to salaryMin',
  path: ['salaryMax'],
})

export type Offer = z.infer<typeof offerSchema>
