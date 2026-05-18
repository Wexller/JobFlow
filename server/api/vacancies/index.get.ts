import { createJobflowService } from '../../application/jobflowService'
import { getServerJobflowRepository } from '../../repositories/jobflowRepository'
import { runApiHandler } from '../../utils/api'

export default defineEventHandler((event) =>
  runApiHandler(event, 'vacancy.list', async () => {
    const service = createJobflowService(getServerJobflowRepository())
    return service.listVacancies()
  }))
