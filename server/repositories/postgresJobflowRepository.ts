import type { Interview } from '../../app/schemas/interviews.schema'
import { interviewSchema } from '../../app/schemas/interviews.schema'
import type { Offer } from '../../app/schemas/offers.schema'
import { offerSchema } from '../../app/schemas/offers.schema'
import type { PipelineEvent } from '../../app/schemas/pipeline.schema'
import { pipelineEventSchema } from '../../app/schemas/pipeline.schema'
import type { JobflowSnapshot, VacancyDetails } from '../../app/schemas/jobflow.schema'
import { jobflowSnapshotSchema, vacancyDetailsSchema } from '../../app/schemas/jobflow.schema'
import type { Vacancy } from '../../app/schemas/vacancies.schema'
import { vacancySchema } from '../../app/schemas/vacancies.schema'
import { buildVacancyDetails } from '../../app/utils/jobflow'
import { createAppError, err, ok, type Result } from '../../app/utils/result'
import type { JobflowRepository } from '../../app/repositories/jobflow'
import { createPostgresSqlClient, type SqlClient } from './postgres/sqlClient'

type DbVacancyRow = {
  id: string
  company: string
  role: string
  status: string
  priority: string
  format: string
  source: string | null
  location: string | null
  level: string | null
  tech_stack: string[] | null
  salary_min: number | string | null
  salary_max: number | string | null
  currency: string | null
  match_score: number | string | null
  applied_at: string | Date | null
  next_action_at: string | Date | null
  created_at: string | Date
  updated_at: string | Date
  archived_at: string | Date | null
  notes: string | null
}

type DbPipelineEventRow = {
  id: string
  vacancy_id: string
  stage: string
  status: string
  title: string | null
  occurred_at: string | Date | null
  scheduled_at: string | Date | null
  completed_at: string | Date | null
  notes: string | null
}

type DbInterviewRow = {
  id: string
  vacancy_id: string
  pipeline_event_id: string | null
  stage: string
  scheduled_at: string | Date
  result: string
  interviewer_names: string[] | null
  location: string | null
  notes: string | null
}

type DbOfferRow = {
  id: string
  vacancy_id: string
  decision: string
  offered_at: string | Date | null
  decision_due_at: string | Date | null
  salary_min: number | string | null
  salary_max: number | string | null
  currency: string | null
  notes: string | null
}

function toOptionalNumber(value: number | string | null | undefined): number | undefined {
  if (value === null || value === undefined) {
    return undefined
  }

  const parsed = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(parsed)) {
    return undefined
  }

  return parsed
}

type PgErrorShape = {
  readonly code?: string
  readonly message?: string
}

function isoDate(value: string | Date | null | undefined): string | undefined {
  if (value === null || value === undefined) {
    return undefined
  }

  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return date.toISOString().slice(0, 10)
}

function isoDateTime(value: string | Date | null | undefined): string | undefined {
  if (value === null || value === undefined) {
    return undefined
  }

  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return date.toISOString()
}

function toVacancy(row: DbVacancyRow): Result<Vacancy> {
  const parsed = vacancySchema.safeParse({
    id: row.id,
    company: row.company,
    role: row.role,
    status: row.status,
    priority: row.priority,
    format: row.format,
    source: row.source ?? undefined,
    location: row.location ?? undefined,
    level: row.level ?? undefined,
    techStack: row.tech_stack ?? [],
    salaryMin: toOptionalNumber(row.salary_min),
    salaryMax: toOptionalNumber(row.salary_max),
    currency: row.currency ?? undefined,
    matchScore: toOptionalNumber(row.match_score),
    appliedAt: isoDate(row.applied_at),
    nextActionAt: isoDateTime(row.next_action_at),
    createdAt: isoDateTime(row.created_at),
    updatedAt: isoDateTime(row.updated_at),
    archivedAt: isoDateTime(row.archived_at),
    notes: row.notes ?? undefined,
  })

  if (!parsed.success) {
    return err(createAppError('validation', 'Invalid vacancy row returned from postgres', {
      cause: parsed.error,
    }))
  }

  return ok(parsed.data)
}

function toPipelineEvent(row: DbPipelineEventRow): Result<PipelineEvent> {
  const parsed = pipelineEventSchema.safeParse({
    id: row.id,
    vacancyId: row.vacancy_id,
    stage: row.stage,
    status: row.status,
    title: row.title ?? undefined,
    occurredAt: isoDateTime(row.occurred_at),
    scheduledAt: isoDateTime(row.scheduled_at),
    completedAt: isoDateTime(row.completed_at),
    notes: row.notes ?? undefined,
  })

  if (!parsed.success) {
    return err(createAppError('validation', 'Invalid pipeline event row returned from postgres', {
      cause: parsed.error,
    }))
  }

  return ok(parsed.data)
}

function toInterview(row: DbInterviewRow): Result<Interview> {
  const parsed = interviewSchema.safeParse({
    id: row.id,
    vacancyId: row.vacancy_id,
    pipelineEventId: row.pipeline_event_id ?? undefined,
    stage: row.stage,
    scheduledAt: isoDateTime(row.scheduled_at),
    result: row.result,
    interviewerNames: row.interviewer_names ?? [],
    location: row.location ?? undefined,
    notes: row.notes ?? undefined,
  })

  if (!parsed.success) {
    return err(createAppError('validation', 'Invalid interview row returned from postgres', {
      cause: parsed.error,
    }))
  }

  return ok(parsed.data)
}

function toOffer(row: DbOfferRow): Result<Offer> {
  const parsed = offerSchema.safeParse({
    id: row.id,
    vacancyId: row.vacancy_id,
    decision: row.decision,
    offeredAt: isoDateTime(row.offered_at),
    decisionDueAt: isoDateTime(row.decision_due_at),
    salaryMin: toOptionalNumber(row.salary_min),
    salaryMax: toOptionalNumber(row.salary_max),
    currency: row.currency ?? undefined,
    notes: row.notes ?? undefined,
  })

  if (!parsed.success) {
    return err(createAppError('validation', 'Invalid offer row returned from postgres', {
      cause: parsed.error,
    }))
  }

  return ok(parsed.data)
}

function mapPgError(error: unknown, fallbackMessage: string) {
  const pgError = error as PgErrorShape

  if (pgError.code === '23505') {
    return createAppError('conflict', pgError.message ?? fallbackMessage)
  }

  if (pgError.code === '23503') {
    return createAppError('validation', pgError.message ?? fallbackMessage)
  }

  return createAppError('unknown', pgError.message ?? fallbackMessage)
}

function ensureIdMatch(expectedId: string, actualId: string, entityType: string): Result<string> {
  if (expectedId === actualId) {
    return ok(actualId)
  }

  return err(createAppError('validation', `Mismatched ${entityType} identifier`))
}

async function ensurePipelineEventBelongsToVacancy(client: SqlClient, pipelineEventId: string, vacancyId: string) {
  const result = await client.query<{ vacancy_id: string }>(
    'SELECT vacancy_id FROM pipeline_events WHERE id = $1 LIMIT 1',
    [pipelineEventId],
  )

  const row = result.rows[0]

  if (row === undefined) {
    return err(createAppError('not_found', `Pipeline event ${pipelineEventId} was not found`))
  }

  if (row.vacancy_id !== vacancyId) {
    return err(createAppError('validation', 'Interview pipelineEventId must belong to the same vacancy'))
  }

  return ok(pipelineEventId)
}

async function listVacancyRows(client: SqlClient) {
  return client.query<DbVacancyRow>(
    `SELECT * FROM vacancies
     ORDER BY company ASC, id ASC`,
  )
}

async function listPipelineEventRows(client: SqlClient) {
  return client.query<DbPipelineEventRow>(
    `SELECT * FROM pipeline_events
     ORDER BY COALESCE(scheduled_at, occurred_at, completed_at) ASC NULLS LAST, id ASC`,
  )
}

async function listInterviewRows(client: SqlClient) {
  return client.query<DbInterviewRow>(
    `SELECT * FROM interviews
     ORDER BY scheduled_at ASC, id ASC`,
  )
}

async function listOfferRows(client: SqlClient) {
  return client.query<DbOfferRow>(
    `SELECT * FROM offers
     ORDER BY id ASC`,
  )
}

function rowsToVacancies(rows: DbVacancyRow[]): Result<Vacancy[]> {
  const mapped: Vacancy[] = []

  for (const row of rows) {
    const parsed = toVacancy(row)
    if (!parsed.ok) {
      return parsed
    }

    mapped.push(parsed.value)
  }

  return ok(mapped)
}

function rowsToPipelineEvents(rows: DbPipelineEventRow[]): Result<PipelineEvent[]> {
  const mapped: PipelineEvent[] = []

  for (const row of rows) {
    const parsed = toPipelineEvent(row)
    if (!parsed.ok) {
      return parsed
    }

    mapped.push(parsed.value)
  }

  return ok(mapped)
}

function rowsToInterviews(rows: DbInterviewRow[]): Result<Interview[]> {
  const mapped: Interview[] = []

  for (const row of rows) {
    const parsed = toInterview(row)
    if (!parsed.ok) {
      return parsed
    }

    mapped.push(parsed.value)
  }

  return ok(mapped)
}

function rowsToOffers(rows: DbOfferRow[]): Result<Offer[]> {
  const mapped: Offer[] = []

  for (const row of rows) {
    const parsed = toOffer(row)
    if (!parsed.ok) {
      return parsed
    }

    mapped.push(parsed.value)
  }

  return ok(mapped)
}

async function buildSnapshot(client: SqlClient): Promise<Result<JobflowSnapshot>> {
  const [vacanciesResult, pipelineEventsResult, interviewsResult, offersResult] = await Promise.all([
    listVacancyRows(client),
    listPipelineEventRows(client),
    listInterviewRows(client),
    listOfferRows(client),
  ])

  const vacancies = rowsToVacancies(vacanciesResult.rows)
  if (!vacancies.ok) {
    return vacancies
  }

  const pipelineEvents = rowsToPipelineEvents(pipelineEventsResult.rows)
  if (!pipelineEvents.ok) {
    return pipelineEvents
  }

  const interviews = rowsToInterviews(interviewsResult.rows)
  if (!interviews.ok) {
    return interviews
  }

  const offers = rowsToOffers(offersResult.rows)
  if (!offers.ok) {
    return offers
  }

  const snapshotParsed = jobflowSnapshotSchema.safeParse({
    interviews: interviews.value,
    offers: offers.value,
    pipelineEvents: pipelineEvents.value,
    vacancies: vacancies.value,
  })

  if (!snapshotParsed.success) {
    return err(createAppError('validation', 'Invalid snapshot assembled from postgres rows', {
      cause: snapshotParsed.error,
    }))
  }

  return ok(snapshotParsed.data)
}

export function createPostgresJobflowRepository(clientFactory: () => Promise<SqlClient> = createPostgresSqlClient): JobflowRepository {
  return {
    async getSnapshot() {
      try {
        const client = await clientFactory()
        return buildSnapshot(client)
      }
      catch (error) {
        return err(mapPgError(error, 'Failed to load snapshot from postgres'))
      }
    },
    async listVacancies() {
      try {
        const client = await clientFactory()
        const rows = await listVacancyRows(client)
        return rowsToVacancies(rows.rows)
      }
      catch (error) {
        return err(mapPgError(error, 'Failed to list vacancies from postgres'))
      }
    },
    async getVacancyDetails(vacancyId) {
      try {
        const client = await clientFactory()
        const snapshotResult = await buildSnapshot(client)

        if (!snapshotResult.ok) {
          return snapshotResult
        }

        const details = buildVacancyDetails(snapshotResult.value, vacancyId)

        if (details === undefined) {
          return err(createAppError('not_found', `Vacancy ${vacancyId} was not found`))
        }

        const parsed = vacancyDetailsSchema.safeParse(details)

        if (!parsed.success) {
          return err(createAppError('validation', 'Invalid vacancy details assembled from postgres rows', {
            cause: parsed.error,
          }))
        }

        return ok(parsed.data)
      }
      catch (error) {
        return err(mapPgError(error, 'Failed to load vacancy details from postgres'))
      }
    },
    async createVacancy(vacancy) {
      try {
        const client = await clientFactory()
        const result = await client.query<DbVacancyRow>(
          `INSERT INTO vacancies (
            id, company, role, status, priority, format, source, location, level, tech_stack,
            salary_min, salary_max, currency, match_score, applied_at, next_action_at,
            created_at, updated_at, archived_at, notes
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16,
            $17, $18, $19, $20
          )
          RETURNING *`,
          [
            vacancy.id,
            vacancy.company,
            vacancy.role,
            vacancy.status,
            vacancy.priority,
            vacancy.format,
            vacancy.source ?? null,
            vacancy.location ?? null,
            vacancy.level ?? null,
            vacancy.techStack,
            vacancy.salaryMin ?? null,
            vacancy.salaryMax ?? null,
            vacancy.currency ?? null,
            vacancy.matchScore ?? null,
            vacancy.appliedAt ?? null,
            vacancy.nextActionAt ?? null,
            vacancy.createdAt,
            vacancy.updatedAt,
            vacancy.archivedAt ?? null,
            vacancy.notes ?? null,
          ],
        )

        const row = result.rows[0]
        if (row === undefined) {
          return err(createAppError('unknown', 'Postgres did not return created vacancy'))
        }

        return toVacancy(row)
      }
      catch (error) {
        return err(mapPgError(error, `Failed to create vacancy ${vacancy.id}`))
      }
    },
    async updateVacancy(vacancyId, vacancy) {
      const idCheck = ensureIdMatch(vacancyId, vacancy.id, 'vacancy')
      if (!idCheck.ok) {
        return idCheck
      }

      try {
        const client = await clientFactory()
        const result = await client.query<DbVacancyRow>(
          `UPDATE vacancies SET
            company = $2,
            role = $3,
            status = $4,
            priority = $5,
            format = $6,
            source = $7,
            location = $8,
            level = $9,
            tech_stack = $10,
            salary_min = $11,
            salary_max = $12,
            currency = $13,
            match_score = $14,
            applied_at = $15,
            next_action_at = $16,
            created_at = $17,
            updated_at = $18,
            archived_at = $19,
            notes = $20
          WHERE id = $1
          RETURNING *`,
          [
            vacancy.id,
            vacancy.company,
            vacancy.role,
            vacancy.status,
            vacancy.priority,
            vacancy.format,
            vacancy.source ?? null,
            vacancy.location ?? null,
            vacancy.level ?? null,
            vacancy.techStack,
            vacancy.salaryMin ?? null,
            vacancy.salaryMax ?? null,
            vacancy.currency ?? null,
            vacancy.matchScore ?? null,
            vacancy.appliedAt ?? null,
            vacancy.nextActionAt ?? null,
            vacancy.createdAt,
            vacancy.updatedAt,
            vacancy.archivedAt ?? null,
            vacancy.notes ?? null,
          ],
        )

        const row = result.rows[0]
        if (row === undefined) {
          return err(createAppError('not_found', `Vacancy ${vacancyId} was not found`))
        }

        return toVacancy(row)
      }
      catch (error) {
        return err(mapPgError(error, `Failed to update vacancy ${vacancyId}`))
      }
    },
    async createPipelineEvent(pipelineEvent) {
      try {
        const client = await clientFactory()
        const result = await client.query<DbPipelineEventRow>(
          `INSERT INTO pipeline_events (
            id, vacancy_id, stage, status, title, occurred_at, scheduled_at, completed_at, notes
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9
          )
          RETURNING *`,
          [
            pipelineEvent.id,
            pipelineEvent.vacancyId,
            pipelineEvent.stage,
            pipelineEvent.status,
            pipelineEvent.title ?? null,
            pipelineEvent.occurredAt ?? null,
            pipelineEvent.scheduledAt ?? null,
            pipelineEvent.completedAt ?? null,
            pipelineEvent.notes ?? null,
          ],
        )

        const row = result.rows[0]
        if (row === undefined) {
          return err(createAppError('unknown', 'Postgres did not return created pipeline event'))
        }

        return toPipelineEvent(row)
      }
      catch (error) {
        return err(mapPgError(error, `Failed to create pipeline event ${pipelineEvent.id}`))
      }
    },
    async updatePipelineEvent(pipelineEventId, pipelineEvent) {
      const idCheck = ensureIdMatch(pipelineEventId, pipelineEvent.id, 'pipeline event')
      if (!idCheck.ok) {
        return idCheck
      }

      try {
        const client = await clientFactory()
        const result = await client.query<DbPipelineEventRow>(
          `UPDATE pipeline_events SET
            vacancy_id = $2,
            stage = $3,
            status = $4,
            title = $5,
            occurred_at = $6,
            scheduled_at = $7,
            completed_at = $8,
            notes = $9
          WHERE id = $1
          RETURNING *`,
          [
            pipelineEvent.id,
            pipelineEvent.vacancyId,
            pipelineEvent.stage,
            pipelineEvent.status,
            pipelineEvent.title ?? null,
            pipelineEvent.occurredAt ?? null,
            pipelineEvent.scheduledAt ?? null,
            pipelineEvent.completedAt ?? null,
            pipelineEvent.notes ?? null,
          ],
        )

        const row = result.rows[0]
        if (row === undefined) {
          return err(createAppError('not_found', `Pipeline event ${pipelineEventId} was not found`))
        }

        return toPipelineEvent(row)
      }
      catch (error) {
        return err(mapPgError(error, `Failed to update pipeline event ${pipelineEventId}`))
      }
    },
    async createInterview(interview) {
      try {
        const client = await clientFactory()

        if (interview.pipelineEventId !== undefined) {
          const pipelineCheck = await ensurePipelineEventBelongsToVacancy(client, interview.pipelineEventId, interview.vacancyId)
          if (!pipelineCheck.ok) {
            return pipelineCheck
          }
        }

        const result = await client.query<DbInterviewRow>(
          `INSERT INTO interviews (
            id, vacancy_id, pipeline_event_id, stage, scheduled_at, result, interviewer_names, location, notes
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9
          )
          RETURNING *`,
          [
            interview.id,
            interview.vacancyId,
            interview.pipelineEventId ?? null,
            interview.stage,
            interview.scheduledAt,
            interview.result,
            interview.interviewerNames,
            interview.location ?? null,
            interview.notes ?? null,
          ],
        )

        const row = result.rows[0]
        if (row === undefined) {
          return err(createAppError('unknown', 'Postgres did not return created interview'))
        }

        return toInterview(row)
      }
      catch (error) {
        return err(mapPgError(error, `Failed to create interview ${interview.id}`))
      }
    },
    async updateInterview(interviewId, interview) {
      const idCheck = ensureIdMatch(interviewId, interview.id, 'interview')
      if (!idCheck.ok) {
        return idCheck
      }

      try {
        const client = await clientFactory()

        if (interview.pipelineEventId !== undefined) {
          const pipelineCheck = await ensurePipelineEventBelongsToVacancy(client, interview.pipelineEventId, interview.vacancyId)
          if (!pipelineCheck.ok) {
            return pipelineCheck
          }
        }

        const result = await client.query<DbInterviewRow>(
          `UPDATE interviews SET
            vacancy_id = $2,
            pipeline_event_id = $3,
            stage = $4,
            scheduled_at = $5,
            result = $6,
            interviewer_names = $7,
            location = $8,
            notes = $9
          WHERE id = $1
          RETURNING *`,
          [
            interview.id,
            interview.vacancyId,
            interview.pipelineEventId ?? null,
            interview.stage,
            interview.scheduledAt,
            interview.result,
            interview.interviewerNames,
            interview.location ?? null,
            interview.notes ?? null,
          ],
        )

        const row = result.rows[0]
        if (row === undefined) {
          return err(createAppError('not_found', `Interview ${interviewId} was not found`))
        }

        return toInterview(row)
      }
      catch (error) {
        return err(mapPgError(error, `Failed to update interview ${interviewId}`))
      }
    },
    async createOffer(offer) {
      try {
        const client = await clientFactory()
        const result = await client.query<DbOfferRow>(
          `INSERT INTO offers (
            id, vacancy_id, decision, offered_at, decision_due_at, salary_min, salary_max, currency, notes
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9
          )
          RETURNING *`,
          [
            offer.id,
            offer.vacancyId,
            offer.decision,
            offer.offeredAt ?? null,
            offer.decisionDueAt ?? null,
            offer.salaryMin ?? null,
            offer.salaryMax ?? null,
            offer.currency ?? null,
            offer.notes ?? null,
          ],
        )

        const row = result.rows[0]
        if (row === undefined) {
          return err(createAppError('unknown', 'Postgres did not return created offer'))
        }

        return toOffer(row)
      }
      catch (error) {
        return err(mapPgError(error, `Failed to create offer ${offer.id}`))
      }
    },
    async updateOffer(offerId, offer) {
      const idCheck = ensureIdMatch(offerId, offer.id, 'offer')
      if (!idCheck.ok) {
        return idCheck
      }

      try {
        const client = await clientFactory()
        const result = await client.query<DbOfferRow>(
          `UPDATE offers SET
            vacancy_id = $2,
            decision = $3,
            offered_at = $4,
            decision_due_at = $5,
            salary_min = $6,
            salary_max = $7,
            currency = $8,
            notes = $9
          WHERE id = $1
          RETURNING *`,
          [
            offer.id,
            offer.vacancyId,
            offer.decision,
            offer.offeredAt ?? null,
            offer.decisionDueAt ?? null,
            offer.salaryMin ?? null,
            offer.salaryMax ?? null,
            offer.currency ?? null,
            offer.notes ?? null,
          ],
        )

        const row = result.rows[0]
        if (row === undefined) {
          return err(createAppError('not_found', `Offer ${offerId} was not found`))
        }

        return toOffer(row)
      }
      catch (error) {
        return err(mapPgError(error, `Failed to update offer ${offerId}`))
      }
    },
  }
}
