# Architecture Overview

## Summary

Jobflow is now a Nuxt 4 + TypeScript application with an integrated Nitro BFF.
The browser talks to server routes for application data, while the server owns
validation, orchestration, and persistence boundaries.

The target persistence model is DB-first with managed Postgres as the primary
store. Google Sheets remains important, but as an import/sync/export
integration boundary rather than the main online datastore. The current
workspace now runs Postgres-first by default, while an in-memory adapter remains
available as an explicit troubleshooting fallback.

## Recommended Stack

Runtime:

- Node.js 22 or newer
- pnpm 9.14.4 or newer

Core dependencies:

- Nuxt 4
- Vue 3
- TypeScript
- `@nuxtjs/i18n`
- `@pinia/nuxt` and Pinia
- `@vueuse/nuxt` and VueUse
- Nuxt UI v4
- date-fns
- Zod
- ECharts and vue-echarts

Development and testing dependencies:

- `@nuxt/eslint` and ESLint
- `@nuxt/test-utils`
- Vitest
- Vue Test Utils
- happy-dom
- Playwright
- `@pinia/testing`
- MSW

## Application Boundaries

```text
Pages / components
  -> Pinia stores and composables
  -> useFetch / $fetch repository helpers
  -> Nitro BFF routes (`server/api`)
  -> application services (`server/application`)
  -> repository / gateway layer
  -> primary persistence (target: Postgres)
  -> integration gateways (Google Sheets import / sync)
```

Rules:

- UI components receive domain objects, not transport DTOs or raw integration
  payloads.
- Pinia stores do not know Google Sheets details or persistence internals.
- The browser does not talk to Google Sheets directly.
- Request/response DTOs are validated at the BFF boundary.
- Domain data stores stable enum IDs. Translated labels are presentation-only.
- Google Sheets and Postgres adapters must remain replaceable behind repository
  contracts.

## Planned Project Structure

```text
app/
  composables/
    useJobflowSnapshot.ts
  components/
  domain/
  mappers/
  pages/
  repositories/
    jobflow.ts
    jobflowApiRepository.ts
    inMemoryJobflowRepository.ts
    mockRepository.ts
  schemas/
    jobflow.schema.ts
    ...
  stores/
  utils/
server/
  api/
    jobflow/
    vacancies/
    pipeline-events/
    interviews/
    offers/
  application/
    jobflowService.ts
  repositories/
    jobflowRepository.ts
    postgresJobflowRepository.ts
  utils/
    api.ts
tests/
  unit/
  nuxt/
  e2e/
```

## Data And State Strategy

- Zod schemas remain the runtime source of truth for validation.
- Domain models are separate from transport payloads and external row formats.
- The BFF validates all write payloads before they reach persistence.
- Stores own view state, filters, and derived metrics; they do not own
  persistence orchestration.
- Dashboard metrics, filters, sorting, and kanban grouping continue to operate on
  stable enum IDs.
- The server-side application layer is the place for write orchestration and
  cross-entity validation.

## Persistence Strategy

- Target primary store: managed Postgres.
- Implemented Postgres path: server repository + SQL client + migrations + seed.
- Near-term modernization target: Prisma-backed Postgres adapter with temporary
  fallback to legacy SQL repository during cutover.
- Prisma schema/client scaffold is now present under `prisma/schema.prisma`.
- Runtime adapter toggle is available through `JOBFLOW_POSTGRES_ADAPTER=sql|prisma`
  with `sql` as the default and rollback path.
- Default development adapter: Postgres repository with explicit migration/seed
  workflow.
- Google Sheets is planned as a server-side integration gateway for import and
  reconciliation.
- Source-of-truth policy is DB-first. Dual-write is intentionally deferred.

## Logging Strategy

Start with a typed logger wrapper and keep the first useful version centered on
server-side request handling:

- `info`
- `warn`
- `error`
- `audit`

Allowed fields:

- action type;
- entity type;
- entity ID;
- request ID;
- status;
- duration;
- HTTP status;
- retry count;
- sanitized error kind.

Current implementation note:

- server API requests emit structured logs with request IDs;
- BFF error responses return the request ID for correlation;
- client-side logging is not yet standardized across fetch/write flows.
- near-term modernization target is `pino` as server-side sink behind the
  current typed logger API and redaction policy.

Never log:

- OAuth tokens;
- refresh tokens;
- service account secrets;
- raw request bodies;
- raw query parameters containing sensitive data;
- spreadsheet values;
- private notes;
- personal contacts;
- company names;
- salary values;
- raw row data.

## Testing Strategy

- Unit tests: schemas, mappers, result handling, logger redaction, repository behavior, store selectors, and server application services.
- Nuxt tests: the main home page flow with mocked `useFetch` data.
- E2E smoke: dashboard, filters, kanban, details, vacancy save, locale switch.
- Integration checks: Postgres adapter behavior, migrations/seed, and HTTP CRUD
  contract checks through `pnpm db:check`.

CI must not use live credentials. The current Postgres verification lane uses an
isolated ephemeral Postgres database (`db:test:up:compose` + `db:check`).
Google Sheets integrations should continue to use fixtures or mocks unless a
dedicated protected environment is added.

## Sources

- Nuxt testing: https://nuxt.com/docs/4.x/getting-started/testing
- Nuxt UI module: https://nuxt.com/modules/ui/
- Pinia with Nuxt: https://pinia.vuejs.org/ssr/nuxt.html
- VueUse with Nuxt: https://vueuse.org/guide/
- Zod: https://zod.dev/
- Playwright: https://playwright.dev/docs/intro
