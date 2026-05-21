import { readBody } from 'h3'
import { createJobflowService } from '../../../../application/jobflowService'
import { commitOperatorBundle, type OperatorBundleDraft } from '../../../../application/operatorBundle'
import { createJobflowRepository } from '../../../../repositories/jobflowRepository'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ bundle?: OperatorBundleDraft, confirm?: boolean }>(event)
  if (!body?.confirm) {
    throw createError({ message: 'Explicit confirm=true is required before write', statusCode: 400 })
  }
  if (!body.bundle) {
    throw createError({ message: 'bundle is required', statusCode: 400 })
  }
  const service = createJobflowService(createJobflowRepository())
  return commitOperatorBundle(service, body.bundle)
})
