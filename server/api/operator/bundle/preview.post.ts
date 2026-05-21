import { readBody } from 'h3'
import { previewOperatorBundle } from '../../../application/operatorBundle'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ source?: string }>(event)
  const source = body?.source ?? ''
  return previewOperatorBundle(source)
})
