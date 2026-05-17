import { z } from 'zod'
import { vacancyPriorityIds, vacancyStatusIds, workFormatIds } from '../domain/vacancies'
import {
  entityIdSchema,
  isValidMoneyRange,
  isoDateSchema,
  moneyAmountSchema,
  optionalTextSchema,
  percentageSchema,
} from './common.schema'

export const vacancyStatusSchema = z.enum(vacancyStatusIds)
export const vacancyPrioritySchema = z.enum(vacancyPriorityIds)
export const workFormatSchema = z.enum(workFormatIds)

export const vacancySchema = z.object({
  id: entityIdSchema,
  company: z.string().trim().min(1),
  role: z.string().trim().min(1),
  status: vacancyStatusSchema,
  priority: vacancyPrioritySchema,
  format: workFormatSchema,
  source: optionalTextSchema,
  location: optionalTextSchema,
  level: optionalTextSchema,
  techStack: z.array(z.string().trim().min(1)).default([]),
  salaryMin: moneyAmountSchema.optional(),
  salaryMax: moneyAmountSchema.optional(),
  currency: optionalTextSchema,
  matchScore: percentageSchema.optional(),
  appliedAt: isoDateSchema.optional(),
  nextActionAt: isoDateSchema.optional(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
  archivedAt: isoDateSchema.optional(),
  notes: optionalTextSchema,
}).refine(isValidMoneyRange, {
  message: 'salaryMax must be greater than or equal to salaryMin',
  path: ['salaryMax'],
})

export type Vacancy = z.infer<typeof vacancySchema>
