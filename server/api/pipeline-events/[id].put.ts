import { readBody } from 'h3'
import { createJobflowService } from '../../application/jobflowService'
import { getServerJobflowRepository } from '../../repositories/jobflowRepository'
import { runApiHandler } from '../../utils/api'

export default defineEventHandler((event) =>
  runApiHandler(event, 'pipeline_event.update', async () => {
    const service = createJobflowService(getServerJobflowRepository())
    return service.updatePipelineEvent(event.context.params?.id ?? '', await readBody(event))
  }))
