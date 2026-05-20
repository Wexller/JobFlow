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
- a CRM dashboard, vacancy list, filters, kanban, details, and vacancy save
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
- Pino (server logging sink)
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
- `docs/roadmap.active.md` (active planning)
- `docs/roadmap.md` (legacy reference, read-only by default)
- `docs/feature-bank.md` (feature intake and lifecycle registry)
- `docs/refactor-bank.md` (refactor intake and lifecycle registry)
- `docs/fix-bank.md` (fix intake and lifecycle registry)
- `docs/workitem-spec-template.md` (tracked template for local work item specs)
- `docs/workitems/` (local-only work item specs, intentionally excluded from git)
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
docker compose -f docker-compose.local.yml run --rm migrate
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
JOBFLOW_LOG_LEVEL=info
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

## Work Item Delivery Workflow

The repository uses an ID-driven delivery flow:

```text
intake -> bank entry (FEAT/REF/FIX) -> local spec docs/workitems/<ID>.md -> branch <ID> -> implement -> checks -> commit -> PR -> squash merge to main -> move spec to docs/workitems/done/<ID>.md -> release -> done
```

Rules:

- Free-form thoughts, ideas, and problem statements do not need an explicit
  type from the Product Owner. Codex classifies them as `FEAT`, `REF`, or
  `FIX` before creating the bank entry.
- Every accepted feature must be tracked in `docs/feature-bank.md`.
- Every accepted refactor must be tracked in `docs/refactor-bank.md`.
- Every accepted fix must be tracked in `docs/fix-bank.md`.
- Work item IDs use `FEAT-XXX`, `REF-XXX`, or `FIX-XXX` format and are unique
  within their own namespace.
- Study or planning of any work item creates or updates a local-only spec at
  `docs/workitems/<ID>.md`.
- Local specs in `docs/workitems/` are intentionally not tracked in git and must
  not be staged, committed, or included in PR scope.
- After merge to `main`, move the local spec to
  `docs/workitems/done/<ID>.md`.
- Moving the spec file into `docs/workitems/done/` is an archive step for local
  working materials and does not by itself mark the work item as `done`.
- Implementation must follow the local work item spec.
- If the spec does not exist, Codex must stop and wait for explicit approval
  before implementing without a spec.
- By default, `implement FEAT-XXX|REF-XXX|FIX-XXX` means end-to-end delivery:
  create the branch, implement the change, run checks, create the commit, open
  the PR, merge to `main`, and switch back to `main`.
- Legacy bank-tracked flow may use a branch name that matches the local work
  item ID.
- GitHub issue-backed flow must use the branch format
  `type/<issue-number>-short-description`.
- Work item branches are created from `main`.
- Merge policy to `main` is squash merge.
- A merged PR does not automatically mark a work item as done.
- A work item is marked `done` only after confirmed production/market deployment.
- After production release, update the corresponding bank status. Update
  `docs/roadmap.active.md` only when roadmap visibility changes.
- Do not stop at PR handoff unless the Product Owner explicitly asks to pause
  before merge.
- After merge, move the local spec to `docs/workitems/done/<ID>.md` and switch
  back to `main`.

Classification:

- `FEAT`: new capability or new user-facing outcome.
- `REF`: structural improvement without changing intended behavior.
- `FIX`: defect, regression, or incorrect behavior correction.
- If the intake does not specify the type, Codex assigns the work item to the
  best matching classification before generating the ID.

PO command conventions:

- Intake: `new idea: ...` / `новая идея: ...`
- Free-form intake without an explicit type is allowed. Codex decides whether it
  belongs in `FEAT`, `REF`, or `FIX`.
- Refactor intake: `new refactor: ...` / `запиши refactor: ...`
- Fix intake: `new fix: ...` / `запиши fix: ...`
- Study or planning: `plan FEAT-XXX|REF-XXX|FIX-XXX` / `изучи ...` /
  `спланируй ...`
- Implementation: `implement FEAT-XXX|REF-XXX|FIX-XXX` / `реализуй ...`
- Text-only study, planning, or implementation requests require explicit
  confirmation of the target work item ID before work starts.

## GitHub Naming Policy

When work is tracked by GitHub issue, use the GitHub issue number as the
canonical implementation reference for branches, commits, and PR titles.

Issue title:

- Format: `[type][scope1,scope2] Human-readable title`
- Types: `feat`, `fix`, `ref`
- Example: `[fix][home,mobile] Main page table is unusable on mobile`

Branch name:

- Format: `type/<issue-number>-short-description`
- Examples:
  - `fix/123-home-mobile-table`
  - `feat/145-vacancy-search`
  - `ref/203-store-composition-api`

Commit message:

- Format: `type(scope1,scope2): message (#issue-number)`
- Examples:
  - `fix(home,mobile): make main page table usable on mobile (#123)`
  - `feat(vacancies,forms): replace vacancy select with searchable input (#145)`
  - `ref(store,pinia): move jobflow store to composition api (#203)`

PR title:

- Use the same format as the final squash commit title.
- Example:
  - `fix(home,mobile): make main page table usable on mobile (#123)`

Rules:

- Do not use an `ISSUE-*` prefix in branch names, commits, or PR titles.
- Type must stay consistent across issue title, branch name, commit, and PR.
- Use one to three lowercase kebab-case scopes.
- Prefer product or system areas such as `home`, `mobile`, `vacancies`,
  `forms`, `store`, `pinia`, `api`, `db`, `tests`, or `docs`.
- One branch and one PR should map to one primary issue.
- Do not rely on automatic issue closing keywords when a task becomes `done`
  only after confirmed release.

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
