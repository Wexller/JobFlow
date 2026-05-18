import { readBody } from 'h3'
import { createJobflowService } from '../../application/jobflowService'
import { getServerJobflowRepository } from '../../repositories/jobflowRepository'
import { runApiHandler } from '../../utils/api'

export default defineEventHandler((event) =>
  runApiHandler(event, 'interview.create', async () => {
    const service = createJobflowService(getServerJobflowRepository())
    return service.createInterview(await readBody(event))
  }))
