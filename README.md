# Jobflow

Jobflow is a Nuxt 4 + TypeScript job-search CRM with an integrated server-side
BFF. The frontend talks only to Nuxt/Nitro API routes, while the server owns
data orchestration, validation, and persistence boundaries.

The product direction is DB-first: managed Postgres is the target primary store.
Google Sheets is now treated as an integration boundary for import, sync, and
export flows rather than the main runtime data source.

## Current Status

The repository currently includes:

- the agent operating model and persona registry;
- a typed job-search CRM domain with Zod validation;
- a Nuxt/Nitro BFF with read/write API routes;
- a server-side application layer and repository contracts;
- an implemented Postgres runtime path with migrations and seed scripts;
- an optional in-memory persistence adapter behind the same BFF contracts for
  troubleshooting;
- a mock CRM dashboard, vacancy list, filters, kanban, details, and vacancy save
  flow using `useFetch` for reads and `$fetch`-compatible writes;
- unit and Nuxt coverage for stores, mappers, logging, server application
  behavior, and the main home page flow.

Managed Postgres is the documented production target, and this workspace now
runs Postgres-first by default. Real-DB verification is available through
`pnpm db:check`.

## Runtime Model

```text
Pages / components
  -> Pinia stores and composables
  -> Nuxt/Nitro BFF (`server/api`)
  -> application services
  -> repository / gateway layer
  -> primary persistence (target: Postgres)
  -> integration gateways (Google Sheets sync/import)
```

## API Usage Convention

- Reads: `useFetch`
- Writes: `$fetch` via repository/client helpers

The UI should not call Google Sheets directly and should not bypass the BFF for
application data.

## Preferred Stack

- Nuxt 4
- Vue 3
- TypeScript
- Pinia
- Nuxt UI
- VueUse
- date-fns
- Zod
- Prisma (planned migration target for Postgres adapter)
- Pino (planned server logging sink)
- ECharts / vue-echarts
- Vitest
- Vue Test Utils
- Playwright

## Runtime Requirements

- Node.js 22 or newer
- pnpm 9.14.4 or newer

Use the repository Node version with:

```bash
nvm use
```

## Architecture Decisions

The current architecture direction is documented in:

- `docs/architecture/overview.md`
- `docs/roadmap.md`
- `docs/architecture/adr/0001-frontend-only-google-sheets.md`
- `docs/architecture/adr/0002-i18n-browser-locale.md`
- `docs/architecture/adr/0003-data-state-boundaries.md`
- `docs/architecture/adr/0004-nuxt-bff-postgres-primary-persistence.md`

Key decisions:

- use a Nuxt/Nitro BFF as the single application entrypoint;
- keep Google Sheets behind server-side integration gateways;
- target managed Postgres as the primary persistence layer;
- keep Zod as the validation boundary for client payloads, API DTOs, and external
  mapping;
- keep stable enum IDs in data and localize labels only in the UI.

## Commands

Use pnpm:

```bash
pnpm dev
pnpm build
pnpm preview
pnpm typecheck
pnpm lint
pnpm test
pnpm test:unit
pnpm test:nuxt
pnpm test:e2e
pnpm test:ci
pnpm db:migrate
pnpm db:seed
pnpm db:test:up
pnpm db:test:down
pnpm db:test:reset
pnpm db:test:up:compose
pnpm db:test:down:compose
pnpm db:test:url
pnpm db:check:migrations-seed
pnpm db:check:repository
pnpm db:check:http
pnpm db:check
pnpm db:backup
pnpm db:restore
pnpm prisma:validate
pnpm prisma:generate
```

`pnpm test:ci` is the full local quality gate. It runs linting, TypeScript
checking, unit tests, Nuxt component tests, Playwright e2e smoke tests, and the
production build.

Playwright e2e tests build the app and then run against the local Nuxt server.
Install the Chromium browser binary before running `pnpm test:e2e` or
`pnpm test:ci` in a fresh environment:

```bash
pnpm exec playwright install chromium
```

In Linux CI environments, install browser system dependencies as well:

```bash
pnpm exec playwright install --with-deps chromium
```

## Local Development

Local development is Postgres-first:

```bash
pnpm install
pnpm dev
```

Default runtime expectations:

- `JOBFLOW_PERSISTENCE_DRIVER=postgres`
- `JOBFLOW_DATABASE_URL` points to a reachable Postgres instance

For local Postgres setup, run migrations and seed fixtures:

```bash
JOBFLOW_DATABASE_URL=postgres://... pnpm db:migrate
JOBFLOW_DATABASE_URL=postgres://... pnpm db:seed
# optional: JOBFLOW_DB_SEED_PROFILE=e2e|perf
```

`pnpm db:migrate` is idempotent: it records applied SQL files in
`schema_migrations` and skips already applied migrations on subsequent runs.

`pnpm db:seed` supports seed profiles via `JOBFLOW_DB_SEED_PROFILE`:

- `dev` (default): developer-friendly baseline CRM dataset
- `e2e`: stable deterministic dataset for end-to-end checks
- `perf`: larger fixture profile for load/performance-oriented local checks

For isolated integration work, an ephemeral local Postgres workflow is
available (Docker required):

```bash
pnpm db:test:up
JOBFLOW_DATABASE_URL="$(pnpm -s db:test:url)" pnpm db:migrate
JOBFLOW_DATABASE_URL="$(pnpm -s db:test:url)" pnpm db:seed
# optional: JOBFLOW_DB_SEED_PROFILE=e2e|perf
pnpm db:test:down
```

`pnpm db:test:up` and `pnpm db:test:down` remain script-based wrappers around
`docker run` and `docker rm` for environments where Compose may be unavailable.

Optional test DB overrides:

- `JOBFLOW_TEST_DB_CONTAINER`
- `JOBFLOW_TEST_DB_PORT`
- `JOBFLOW_TEST_DB_USER`
- `JOBFLOW_TEST_DB_PASSWORD`
- `JOBFLOW_TEST_DB_NAME`

For integration/smoke tests against an already running Postgres instance, set:

- `JOBFLOW_TEST_MANAGE_DB=false`

This disables automatic `db:test:up`/`db:test:down` inside the tests.

Run Postgres verification lane:

```bash
JOBFLOW_DATABASE_URL="$(pnpm -s db:test:url)" pnpm db:check:migrations-seed
JOBFLOW_DATABASE_URL="$(pnpm -s db:test:url)" pnpm db:check:repository
JOBFLOW_DATABASE_URL="$(pnpm -s db:test:url)" pnpm db:check:http
pnpm db:check
```

## Docker Deployment Profiles

Two compose profiles are maintained:

- `docker-compose.local.yml`: local development (`app` + `postgres` with bind mount).
- `docker-compose.prod.yml`: self-hosted production-like runtime (`app` + `postgres`) plus one-off `migrate` job.

Local compose flow:

```bash
docker compose -f docker-compose.local.yml up -d postgres
JOBFLOW_DATABASE_URL=postgres://${JOBFLOW_LOCAL_DB_USER:-jobflow}:${JOBFLOW_LOCAL_DB_PASSWORD:-jobflow}@localhost:${JOBFLOW_LOCAL_DB_PORT:-55432}/${JOBFLOW_LOCAL_DB_NAME:-jobflow_local} pnpm db:migrate
JOBFLOW_DATABASE_URL=postgres://${JOBFLOW_LOCAL_DB_USER:-jobflow}:${JOBFLOW_LOCAL_DB_PASSWORD:-jobflow}@localhost:${JOBFLOW_LOCAL_DB_PORT:-55432}/${JOBFLOW_LOCAL_DB_NAME:-jobflow_local} pnpm db:seed
docker compose -f docker-compose.local.yml up app
```

Prod-like compose flow with explicit migration step:

```bash
export JOBFLOW_PROD_DB_USER=jobflow_prod
export JOBFLOW_PROD_DB_PASSWORD='<strong-password>'
export JOBFLOW_PROD_DB_NAME=jobflow
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d postgres
docker compose -f docker-compose.prod.yml run --rm migrate
docker compose -f docker-compose.prod.yml up -d app
```

Stop profiles:

```bash
docker compose -f docker-compose.local.yml down
docker compose -f docker-compose.prod.yml down
```

Smoke API checks for container runtime:

```bash
curl -f http://localhost:${JOBFLOW_APP_PORT:-3000}/api/jobflow/snapshot
curl -f http://localhost:${JOBFLOW_APP_PORT:-3000}/api/vacancies
```

`JOBFLOW_PERSISTENCE_DRIVER=postgres` is required in both compose profiles.
`docker-compose.prod.yml` does not publish Postgres to host and requires explicit
production DB credentials via env vars.

Compose config validation commands:

```bash
docker compose -f docker-compose.local.yml config
docker compose -f docker-compose.prod.yml config
```

## Backup And Restore Runbook (Local/Staging)

For containerized local/staging Postgres workflows:

1. Ensure the target container is running.
2. Create a backup dump:

```bash
# Test DB workflow
pnpm db:test:up:compose
pnpm db:backup

# Local compose DB workflow
JOBFLOW_TEST_DB_CONTAINER="${JOBFLOW_LOCAL_DB_CONTAINER:-jobflow-local-postgres}" \
JOBFLOW_TEST_DB_USER="${JOBFLOW_LOCAL_DB_USER:-jobflow}" \
JOBFLOW_TEST_DB_NAME="${JOBFLOW_LOCAL_DB_NAME:-jobflow_local}" \
pnpm db:backup
# optional overrides:
# JOBFLOW_DB_BACKUP_DIR=... JOBFLOW_DB_BACKUP_NAME=... pnpm db:backup
```

3. Restore from a backup dump:

```bash
JOBFLOW_DB_BACKUP_PATH=/absolute/path/to/backup.dump JOBFLOW_DB_RESTORE_FORCE=true pnpm db:restore

# Local compose DB workflow
JOBFLOW_TEST_DB_CONTAINER="${JOBFLOW_LOCAL_DB_CONTAINER:-jobflow-local-postgres}" \
JOBFLOW_TEST_DB_USER="${JOBFLOW_LOCAL_DB_USER:-jobflow}" \
JOBFLOW_TEST_DB_NAME="${JOBFLOW_LOCAL_DB_NAME:-jobflow_local}" \
JOBFLOW_DB_BACKUP_PATH=/absolute/path/to/backup.dump \
JOBFLOW_DB_RESTORE_FORCE=true pnpm db:restore
```

Operational notes:

- `db:backup` uses `pg_dump -Fc` inside the running Postgres container and
  copies the dump to `db/backups/` by default.
- `db:restore` copies the dump into the container and runs `pg_restore --clean`
  against the target database (requires `JOBFLOW_DB_RESTORE_FORCE=true`).
- Keep backups out of git history and handle staging dumps as sensitive data.

## Environment Variables

Public runtime variables:

```env
NUXT_PUBLIC_APP_ENV=local
NUXT_PUBLIC_DEFAULT_LOCALE=en
NUXT_PUBLIC_FALLBACK_LOCALE=en
NUXT_PUBLIC_SENTRY_DSN=
```

Private server runtime variables:

```env
JOBFLOW_PERSISTENCE_DRIVER=postgres
JOBFLOW_DATABASE_URL=
JOBFLOW_POSTGRES_ADAPTER=sql
JOBFLOW_GOOGLE_SHEETS_SPREADSHEET_ID=
JOBFLOW_GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL=
JOBFLOW_GOOGLE_SHEETS_PRIVATE_KEY=
```

`JOBFLOW_DATABASE_URL` is used by the implemented Postgres adapter path.
`JOBFLOW_POSTGRES_ADAPTER` controls Postgres repository implementation:

- `sql` (default): current SQL repository.
- `prisma`: Prisma-scaffolded adapter path (currently delegates to SQL for parity).

Google Sheets credentials are reserved for the future sync/import gateway and
must never be exposed to frontend code.

Container-related variables:

```env
JOBFLOW_APP_PORT=3000
JOBFLOW_LOCAL_DB_CONTAINER=jobflow-local-postgres
JOBFLOW_LOCAL_DB_PORT=55432
JOBFLOW_LOCAL_DB_USER=jobflow
JOBFLOW_LOCAL_DB_PASSWORD=jobflow
JOBFLOW_LOCAL_DB_NAME=jobflow_local
JOBFLOW_PROD_DB_CONTAINER=jobflow-prod-postgres
JOBFLOW_PROD_DB_USER=jobflow_prod
JOBFLOW_PROD_DB_PASSWORD=change_me_strong_password
JOBFLOW_PROD_DB_NAME=jobflow
```

Operational/test variables:

```env
JOBFLOW_TEST_DB_CONTAINER=jobflow-test-postgres
JOBFLOW_TEST_DB_PORT=55432
JOBFLOW_TEST_DB_USER=jobflow
JOBFLOW_TEST_DB_PASSWORD=jobflow
JOBFLOW_TEST_DB_NAME=jobflow_test
JOBFLOW_TEST_MANAGE_DB=true
JOBFLOW_HTTP_CHECK_PORT=4011
JOBFLOW_DB_BACKUP_DIR=./db/backups
JOBFLOW_DB_BACKUP_NAME=
JOBFLOW_DB_BACKUP_PATH=
JOBFLOW_DB_RESTORE_FORCE=false
```

## Testing Strategy

The current automated checks cover:

- unit tests for schemas, mappers, repositories, server services, logging, and
  store behavior;
- Nuxt tests for the main home page rendering flow;
- Playwright smoke coverage for the localized dashboard, filters, details, form
  save, and locale switching.

The current automated checks include a dedicated Postgres verification lane via
`pnpm db:check` (migration/seed and repository behavior checks against a live
database).

Current test database direction:

- `unit`, `nuxt`, and `e2e smoke` remain database-free;
- `db:check` validates Postgres-specific behavior and should run before release
  and in CI for PG-first environments.

## Postgres Runtime Expectations

Local development:

- Default mode remains `JOBFLOW_PERSISTENCE_DRIVER=postgres`.
- To run the Postgres path locally, set:
  - `JOBFLOW_PERSISTENCE_DRIVER=postgres`
  - `JOBFLOW_DATABASE_URL=postgres://...`
- Initialize schema and seed before running the app against Postgres:
  - `JOBFLOW_DATABASE_URL=... pnpm db:migrate`
  - `JOBFLOW_DATABASE_URL=... pnpm db:seed`

Production/runtime expectations:

- `JOBFLOW_DATABASE_URL` must point to a reachable managed Postgres instance.
- Migrations are expected to be applied before rollout of a new runtime version.
- Seed is for local/dev/test workflows only and should not be used in production.
- If Postgres is unavailable at runtime, server routes return repository errors;
  monitor application logs and health checks before switching default driver.

## Release Notes

- `docs/release/mvp-readiness-notes.md` documents current MVP verification scope,
  residual operational gaps, and manual release gate expectations.

## Production Deploy Runbook

- `docs/operations/postgres-production-deploy.md` defines PG-first runtime
  prerequisites, deploy sequencing, rollback expectations, and monitoring checks.

## Agent Operating Model

This repository uses an agent operating model to keep product, architecture,
backend, frontend, testing, observability, and review responsibilities clear.

- `AGENTS.md` is the main contract for contributors and agents.
- `docs/agents/registry.md` lists active and reserve agents.
- `docs/agents/operating-model.md` describes delivery lifecycle and gates.
- `docs/agents/personas/` contains one persona file per agent.
- `docs/debugging.md` describes focused, token-efficient debugging handoffs.

## Documentation Rule

`README.md` must remain written in English and must be updated whenever setup,
commands, dependencies, architecture, environment variables, testing, CI,
deployment, or release workflow changes.
