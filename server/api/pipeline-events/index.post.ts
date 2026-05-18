import { readBody } from 'h3'
import { createJobflowService } from '../../application/jobflowService'
import { getServerJobflowRepository } from '../../repositories/jobflowRepository'
import { runApiHandler } from '../../utils/api'

export default defineEventHandler((event) =>
  runApiHandler(event, 'pipeline_event.create', async () => {
    const service = createJobflowService(getServerJobflowRepository())
    return service.createPipelineEvent(await readBody(event))
  }))
