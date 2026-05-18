import { createJobflowService } from '../../application/jobflowService'
import { getServerJobflowRepository } from '../../repositories/jobflowRepository'
import { runApiHandler } from '../../utils/api'

export default defineEventHandler((event) =>
  runApiHandler(event, 'vacancy.details.load', async () => {
    const service = createJobflowService(getServerJobflowRepository())
    return service.getVacancyDetails(event.context.params?.id ?? '')
  }))
