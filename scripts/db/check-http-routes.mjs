import { spawn } from 'node:child_process'

const databaseUrl = process.env.JOBFLOW_DATABASE_URL?.trim()
if (!databaseUrl) {
  console.error('JOBFLOW_DATABASE_URL is required for db:check:http')
  process.exit(1)
}

const port = process.env.JOBFLOW_HTTP_CHECK_PORT ?? '4011'
const baseUrl = `http://127.0.0.1:${port}`

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForServer() {
  for (let attempt = 1; attempt <= 60; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/vacancies`)
      if (response.ok) return
    }
    catch {
      // server is still booting
    }

    await sleep(500)
  }

  throw new Error('Nuxt server did not become ready in time for HTTP db check')
}

async function requestJson(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  })

  const body = await response.json()
  return { body, response }
}

const devServer = spawn('pnpm', ['exec', 'nuxi', 'dev', '--host', '127.0.0.1', '--port', port], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    JOBFLOW_DATABASE_URL: databaseUrl,
    JOBFLOW_PERSISTENCE_DRIVER: 'postgres',
  },
  stdio: 'inherit',
})

try {
  await waitForServer()

  const vacancyPayload = {
    id: 'vacancy-http-check',
    company: 'HTTP Co',
    role: 'API Engineer',
    status: 'applied',
    priority: 'medium',
    format: 'remote',
    techStack: ['TypeScript'],
    createdAt: '2026-05-18T12:00:00Z',
    updatedAt: '2026-05-18T12:00:00Z',
  }

  const created = await requestJson('/api/vacancies', {
    body: JSON.stringify(vacancyPayload),
    method: 'POST',
  })
  if (!created.response.ok || created.body.id !== vacancyPayload.id) {
    throw new Error('POST /api/vacancies failed in HTTP db check')
  }

  const listed = await requestJson('/api/vacancies', { method: 'GET' })
  if (!listed.response.ok || !Array.isArray(listed.body) || listed.body.length === 0) {
    throw new Error('GET /api/vacancies failed in HTTP db check')
  }

  const updated = await requestJson(`/api/vacancies/${vacancyPayload.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...created.body,
      priority: 'high',
      updatedAt: '2026-05-18T12:30:00Z',
    }),
  })
  if (!updated.response.ok || updated.body.priority !== 'high') {
    throw new Error('PUT /api/vacancies/:id failed in HTTP db check')
  }

  const details = await requestJson(`/api/vacancies/${vacancyPayload.id}`, { method: 'GET' })
  if (!details.response.ok || details.body.vacancy?.id !== vacancyPayload.id) {
    throw new Error('GET /api/vacancies/:id failed in HTTP db check')
  }

  const pipelineCreated = await requestJson('/api/pipeline-events', {
    method: 'POST',
    body: JSON.stringify({
      id: 'pipeline-http-check',
      vacancyId: vacancyPayload.id,
      stage: 'applied',
      status: 'planned',
      title: 'HTTP pipeline check',
      scheduledAt: '2026-05-19T10:00:00Z',
    }),
  })
  if (!pipelineCreated.response.ok || pipelineCreated.body.id !== 'pipeline-http-check') {
    throw new Error('POST /api/pipeline-events failed in HTTP db check')
  }

  const interviewCreated = await requestJson('/api/interviews', {
    method: 'POST',
    body: JSON.stringify({
      id: 'interview-http-check',
      vacancyId: vacancyPayload.id,
      pipelineEventId: 'pipeline-http-check',
      stage: 'recruiter_screen',
      scheduledAt: '2026-05-19T11:00:00Z',
      result: 'pending',
      interviewerNames: ['HTTP Tester'],
    }),
  })
  if (!interviewCreated.response.ok || interviewCreated.body.id !== 'interview-http-check') {
    throw new Error('POST /api/interviews failed in HTTP db check')
  }

  const offerCreated = await requestJson('/api/offers', {
    method: 'POST',
    body: JSON.stringify({
      id: 'offer-http-check',
      vacancyId: vacancyPayload.id,
      decision: 'pending',
      offeredAt: '2026-05-20T10:00:00Z',
    }),
  })
  if (!offerCreated.response.ok || offerCreated.body.id !== 'offer-http-check') {
    throw new Error('POST /api/offers failed in HTTP db check')
  }

  console.log('postgres HTTP route integration check passed')
}
finally {
  devServer.kill('SIGTERM')
}
