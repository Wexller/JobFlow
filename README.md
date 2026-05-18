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
- a development in-memory persistence adapter behind the BFF contracts;
- a mock CRM dashboard, vacancy list, filters, kanban, details, and vacancy save
  flow using `useFetch` for reads and `$fetch`-compatible writes;
- unit and Nuxt coverage for stores, mappers, logging, server application
  behavior, and the main home page flow.

Managed Postgres is the documented production target, and the repository already
contains the Postgres adapter path. This workspace still ships with the
in-memory server adapter as the default runtime, and automated verification
against a real Postgres instance is still pending.

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
pnpm db:test:url
pnpm db:check:migrations-seed
pnpm db:check:repository
pnpm db:check
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

Today, local development works out of the box with the in-memory server adapter:

```bash
pnpm install
pnpm dev
```

The BFF defaults to:

- `JOBFLOW_PERSISTENCE_DRIVER=memory`
- seeded mock CRM data behind the server API

The documented target path for shared and production-like environments is:

- `JOBFLOW_PERSISTENCE_DRIVER=postgres`
- `JOBFLOW_DATABASE_URL=...`

The Postgres adapter is implemented in this workspace, but `memory` remains the
safe default for local development until the real-database verification lane is
in place.

For local Postgres setup work, run schema migration and seed fixtures manually:

```bash
JOBFLOW_DATABASE_URL=postgres://... pnpm db:migrate
JOBFLOW_DATABASE_URL=postgres://... pnpm db:seed
```

Both commands use the repository's `pg` dependency and require a reachable
Postgres instance.

For isolated integration work, an ephemeral local Postgres workflow is
available (Docker required):

```bash
pnpm db:test:up
JOBFLOW_DATABASE_URL="$(pnpm -s db:test:url)" pnpm db:migrate
JOBFLOW_DATABASE_URL="$(pnpm -s db:test:url)" pnpm db:seed
pnpm db:test:down
```

If you prefer explicit Docker configuration, use the committed compose file:

```bash
pnpm db:test:up:compose
JOBFLOW_DATABASE_URL="$(pnpm -s db:test:url)" pnpm db:migrate
JOBFLOW_DATABASE_URL="$(pnpm -s db:test:url)" pnpm db:seed
pnpm db:test:down:compose
```

`pnpm db:test:up` and `pnpm db:test:down` remain script-based wrappers around
`docker run` and `docker rm` for environments where Compose may be unavailable.

Optional environment overrides:

- `JOBFLOW_TEST_DB_CONTAINER`
- `JOBFLOW_TEST_DB_PORT`
- `JOBFLOW_TEST_DB_USER`
- `JOBFLOW_TEST_DB_PASSWORD`
- `JOBFLOW_TEST_DB_NAME`

For integration/smoke tests against an already running Postgres instance, set:

- `JOBFLOW_TEST_MANAGE_DB=false`

This disables automatic `db:test:up`/`db:test:down` inside the tests.

Run Postgres verification lane with Node-based wrappers:

```bash
JOBFLOW_DATABASE_URL="$(pnpm -s db:test:url)" pnpm db:check:migrations-seed
JOBFLOW_DATABASE_URL="$(pnpm -s db:test:url)" pnpm db:check:repository
JOBFLOW_DATABASE_URL="$(pnpm -s db:test:url)" pnpm db:check
```

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
JOBFLOW_PERSISTENCE_DRIVER=memory
JOBFLOW_DATABASE_URL=
JOBFLOW_GOOGLE_SHEETS_SPREADSHEET_ID=
JOBFLOW_GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL=
JOBFLOW_GOOGLE_SHEETS_PRIVATE_KEY=
```

`JOBFLOW_DATABASE_URL` is used by the implemented Postgres adapter path.
Google Sheets credentials are reserved for the future sync/import gateway and
must never be exposed to frontend code.

## Testing Strategy

The current automated checks cover:

- unit tests for schemas, mappers, repositories, server services, logging, and
  store behavior;
- Nuxt tests for the main home page rendering flow;
- Playwright smoke coverage for the localized dashboard, filters, details, form
  save, and locale switching.

The current automated checks do not yet require a real Postgres test database.
They validate the in-memory/runtime-agnostic layers, but they do not prove the
SQL adapter, migrations, or seed path against a live database.

The next verification lane should add:

- route-level contract coverage for Nitro handlers;
- repository integration coverage against an isolated ephemeral Postgres
  instance;
- migration and seed smoke verification against that same isolated database;
- sync/import coverage for Google Sheets gateways.

Planned test database direction:

- `unit`, `nuxt`, and `e2e smoke` remain database-free;
- a separate integration suite should use a disposable Postgres database;
- that suite should become mandatory before `postgres` becomes the default
  staging or CI runtime path.

## Postgres Runtime Expectations

Local development:

- Default mode remains `JOBFLOW_PERSISTENCE_DRIVER=memory`.
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
