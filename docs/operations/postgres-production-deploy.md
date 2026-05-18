# Postgres Production Deploy Expectations

## Runtime prerequisites

- `JOBFLOW_PERSISTENCE_DRIVER=postgres`
- `JOBFLOW_DATABASE_URL` points to reachable managed Postgres instance.
- Application runtime can reach Postgres network endpoint with least-privilege credentials.

## Pre-deploy checklist

1. Confirm backup currency for target database.
2. Run migration plan review for pending SQL files in `db/migrations`.
3. Validate release candidate quality gates:
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test:unit`
   - `pnpm test:nuxt`
   - `pnpm test:e2e`
4. Validate Postgres verification lane in isolated environment:
   - `pnpm db:test:up:compose`
   - `JOBFLOW_DATABASE_URL="$(pnpm -s db:test:url)" pnpm db:check`
   - `pnpm db:test:down:compose`

## Deploy sequence

1. Apply migrations against target Postgres:
   - `JOBFLOW_DATABASE_URL=postgres://... pnpm db:migrate`
2. Deploy application runtime.
3. Run post-deploy smoke checks for API routes:
   - `GET /api/jobflow/snapshot`
   - `GET /api/vacancies`
   - one write-path smoke in controlled environment

## Rollback expectations

- Application rollback is allowed if schema remains backward compatible.
- For destructive schema changes, require pre-approved DB rollback path and verified backup restore procedure.
- Never run seed scripts against production data.

## Monitoring expectations

- Track request-level error rate and 5xx spikes on BFF routes.
- Correlate incidents with `x-request-id` values from API errors.
- Escalate immediately on repeated `database connection` failures or migration errors.
