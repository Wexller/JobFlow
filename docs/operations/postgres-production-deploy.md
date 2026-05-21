# Postgres Production Deploy Expectations

## Runtime prerequisites

- `JOBFLOW_PERSISTENCE_DRIVER=postgres`
- `JOBFLOW_DATABASE_URL` points to reachable managed Postgres instance.
- Application runtime can reach Postgres network endpoint with least-privilege credentials.

## Pre-deploy checklist

1. Confirm backup currency for target database.
2. Run migration plan review for pending SQL files in `db/migrations`.
3. Create or confirm the release branch from `main`:
   - `pnpm release:branch -- --version <SemVer>`
   - Expected branch format: `release/<SemVer>`
4. Create the GitHub Release anchor from that branch:
   - `git tag v<SemVer> release/<SemVer>`
   - `git push origin v<SemVer>`
   - `gh release create v<SemVer> --target release/<SemVer> --generate-notes`
5. Validate release branch quality gates:
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test:unit`
   - `pnpm test:nuxt`
   - `pnpm test:e2e`
6. Validate Postgres verification lane in isolated environment:
   - `pnpm db:test:up:compose`
   - `JOBFLOW_DATABASE_URL="$(pnpm -s db:test:url)" pnpm db:check`
   - `pnpm db:test:down:compose`

## Deploy sequence

1. Build and deploy from the release branch `release/<SemVer>`.
2. Apply migrations against target Postgres:
   - `JOBFLOW_DATABASE_URL=postgres://... pnpm db:migrate`
3. Deploy application runtime.
4. Run post-deploy smoke checks for API routes:
   - `GET /api/jobflow/snapshot`
   - `GET /api/vacancies`
   - one write-path smoke in controlled environment

## Self-hosted Compose Sequence

For self-hosted production-like runtime (`docker-compose.prod.yml`):

0. Set explicit production DB credentials in environment:
   - `export JOBFLOW_PROD_DB_USER=...`
   - `export JOBFLOW_PROD_DB_PASSWORD=...`
   - `export JOBFLOW_PROD_DB_NAME=...`
1. Check out the release branch `release/<SemVer>`.
2. Build application image:
   - `docker compose -f docker-compose.prod.yml build`
3. Start Postgres:
   - `docker compose -f docker-compose.prod.yml up -d postgres`
4. Apply migrations via one-off job:
   - `docker compose -f docker-compose.prod.yml run --rm migrate`
5. Start application service:
   - `docker compose -f docker-compose.prod.yml up -d app`
6. Run smoke checks:
   - `curl -f http://localhost:${JOBFLOW_APP_PORT:-3000}/api/jobflow/snapshot`
   - `curl -f http://localhost:${JOBFLOW_APP_PORT:-3000}/api/vacancies`

Important:

- Keep `JOBFLOW_PERSISTENCE_DRIVER=postgres`.
- Build Docker images from the release branch, not from the GitHub Release tag.
- `docker-compose.prod.yml` keeps Postgres internal to the compose network
  (no host port exposure by default).
- `migrate` is intentionally separate from app startup to keep deploy control explicit.

## Rollback expectations

- Application rollback is allowed if schema remains backward compatible.
- For destructive schema changes, require pre-approved DB rollback path and verified backup restore procedure.
- Never run seed scripts against production data.

## Monitoring expectations

- Track request-level error rate and 5xx spikes on BFF routes.
- Correlate incidents with `x-request-id` values from API errors.
- Escalate immediately on repeated `database connection` failures or migration errors.
