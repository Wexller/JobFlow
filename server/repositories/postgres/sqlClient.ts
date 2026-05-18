import { createAppError } from '../../../app/utils/result'

export interface SqlQueryResult<Row = Record<string, unknown>> {
  readonly rows: Row[]
  readonly rowCount: number | null
}

export interface SqlClient {
  readonly query: <Row = Record<string, unknown>>(text: string, params?: unknown[]) => Promise<SqlQueryResult<Row>>
  readonly end: () => Promise<void>
}

type RuntimeConfigShape = {
  readonly databaseUrl?: string
}

const PG_CLIENT_KEY = '__jobflowPostgresSqlClient__'

function getRuntimeConfig(): RuntimeConfigShape {
  return useRuntimeConfig() as RuntimeConfigShape
}

function getDatabaseUrl(): string {
  const databaseUrl = getRuntimeConfig().databaseUrl?.trim()

  if (!databaseUrl) {
    throw createAppError('unknown', 'JOBFLOW_DATABASE_URL is required for postgres persistence')
  }

  return databaseUrl
}

export async function createPostgresSqlClient(): Promise<SqlClient> {
  const globalScope = globalThis as typeof globalThis & {
    [PG_CLIENT_KEY]?: Promise<SqlClient>
  }

  if (globalScope[PG_CLIENT_KEY] !== undefined) {
    return globalScope[PG_CLIENT_KEY]
  }

  globalScope[PG_CLIENT_KEY] = (async () => {
    const databaseUrl = getDatabaseUrl()

    let pgModule: { Pool: new (options: { connectionString: string }) => { query: SqlClient['query'], end: SqlClient['end'] } }

    try {
      const dynamicImport = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<unknown>
      pgModule = await dynamicImport('pg') as typeof pgModule
    }
    catch {
      throw createAppError(
        'unknown',
        'Postgres access layer requires the "pg" package to be installed',
      )
    }

    const pool = new pgModule.Pool({ connectionString: databaseUrl })

    return {
      end: () => pool.end(),
      query: (text, params) => pool.query(text, params),
    }
  })()

  return globalScope[PG_CLIENT_KEY]
}
