import { createJobflowService } from '../../application/jobflowService'
import { getServerJobflowRepository } from '../../repositories/jobflowRepository'
import { runApiHandler } from '../../utils/api'

export default defineEventHandler((event) =>
  runApiHandler(event, 'jobflow.snapshot.load', async () => {
    const service = createJobflowService(getServerJobflowRepository())
    return service.getSnapshot()
  }))
