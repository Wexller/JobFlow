# MVP Readiness Notes (PG-first)

Date: 2026-05-18
Scope: Jobflow Nuxt BFF + Postgres-first runtime

## What is verified now

- BFF CRUD flows for vacancies, pipeline events, interviews, and offers.
- Postgres migration lifecycle with `schema_migrations` and idempotent runner.
- Seed workflow with profiles (`dev`, `e2e`, `perf`).
- HTTP-level integration checks via `pnpm db:check:http`.
- Real-DB verification lane via `pnpm db:check`.

## Remaining operational gaps before required production runtime

1. CI workflow is not yet committed in repository automation files.
2. Backup/restore scripts are currently container-centric; managed Postgres procedures require environment-specific runbooks and access policy alignment.
3. Observability remains request-lifecycle focused; domain-level audit events for critical CRUD transitions are still limited.
4. Google Sheets integration remains intentionally deferred and is not part of current production runtime.

## Release gate recommendation

Treat current state as MVP-ready for controlled PG-first environments when all of the following pass:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test:unit`
- `pnpm test:nuxt`
- `pnpm db:test:up:compose && JOBFLOW_DATABASE_URL="$(pnpm -s db:test:url)" pnpm db:check && pnpm db:test:down:compose`
- `pnpm test:e2e`

## Risk acceptance guidance

- If deploying without CI automation, require manual gate evidence attached to the release candidate.
- If deploying to managed Postgres, confirm migration execution ownership and rollback authority in advance.
