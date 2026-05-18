# Jobflow Roadmap

This roadmap is the working delivery plan for the MVP. It is organized as
vertical slices so the product becomes usable early while the BFF and
persistence architecture harden underneath it.

## Current Baseline

- Agent operating model is documented.
- Nuxt 4 scaffold is created.
- English and Russian i18n are configured with browser locale detection.
- Nuxt UI v4, Pinia, VueUse, Zod, Vitest, Playwright, and ECharts dependencies
  are installed.
- Remote font providers are disabled to keep local builds independent from
  external font metadata.
- The frontend now reads data through the Nuxt/Nitro BFF instead of loading mock
  repository data directly inside the page.
- The repository includes a server-side application layer, typed API
  contracts, request logging, and a development in-memory persistence adapter.
- `pnpm test:unit`, `pnpm test:nuxt`, and `pnpm typecheck` pass on the current
  workspace.

## Milestone 1: BFF Foundation On Nuxt Server

Goal: make the Nuxt server the single application entrypoint.

Owner agents:

- Solution Architect Agent
- Backend / BFF Agent
- Testing Agent
- Observability Agent
- Security & Review Agent

Checklist:

- [x] Add server-side route structure under `server/api`.
- [x] Add a server-side application layer for read/write orchestration.
- [x] Add shared request validation using Zod-backed normalizers.
- [x] Add a shared HTTP error mapping path for BFF responses.
- [x] Add request logging with request IDs and sanitized error categories.
- [x] Move the home page read path to `useFetch`.
- [x] Move the vacancy save path to `$fetch`-style repository writes.
- [x] Add focused automated coverage for server application behavior and API
  utility error handling.

Exit criteria:

- The browser no longer depends on direct data-source access for application
  reads and writes.
- API failures surface as user-visible error states.
- Logging and error mapping are consistent across BFF routes.

## Milestone 2: Postgres Persistence

Goal: replace development memory persistence with the production-target primary
store.

Owner agents:

- Backend / BFF Agent
- Data & State Agent
- Testing Agent
- Security & Review Agent

Checklist:

- [x] Finalize the relational schema for vacancies, pipeline events, interviews,
  and offers.
- [x] Choose and wire the Postgres access layer.
- [x] Add migrations and seed/dev fixtures for the database path.
- [ ] Implement the Postgres-backed repository adapter behind the existing BFF
  contracts.
- [ ] Add repository integration coverage against the real database adapter.
- [ ] Document local database setup and production runtime expectations.

Exit criteria:

- `JOBFLOW_PERSISTENCE_DRIVER=postgres` is supported end-to-end.
- Database-backed CRUD works through the existing BFF routes.
- Repository integration tests cover the production-target adapter.

## Milestone 3: Frontend-To-BFF Migration

Goal: finish moving UI features to the server-backed contract model.

Owner agents:

- Frontend UI Agent
- Backend / BFF Agent
- Data & State Agent
- Testing Agent
- Security & Review Agent

Checklist:

- [x] Home page bootstrap uses `useFetch`.
- [x] Vacancy create/update uses BFF writes.
- [x] Add BFF-backed flows for pipeline event create/update.
- [x] Add BFF-backed flows for interview create/update.
- [x] Add BFF-backed flows for offer create/update.
- [x] Add route-backed detail and list flows to future screens beyond the home
  page.
- [x] Keep loading, empty, error, and success states aligned with async BFF
  operations.

Exit criteria:

- UI state is derived from typed BFF contracts rather than direct data-source
  calls.
- Future screens can be added without bypassing the Nuxt server.

## Milestone 4: Google Sheets Import And Sync

Goal: keep Google Sheets as an integration surface without making it the primary
runtime source again.

Owner agents:

- Google Sheets Platform Agent
- Backend / BFF Agent
- Testing Agent
- Observability Agent
- Security & Review Agent

Checklist:

- [ ] Define the server-side Google Sheets gateway contract.
- [ ] Add one-way import from Google Sheets into the primary store.
- [ ] Add data quality warnings for invalid dates, numbers, headers, and enum
  values.
- [ ] Add explicit reconciliation rules and source-of-truth guidance.
- [ ] Add safe logging around import and sync failures.
- [ ] Add test fixtures and mocked coverage for malformed Sheets rows.
- [ ] Document Google Sheets sync setup and operator workflow.

Exit criteria:

- Sheets data can be imported without exposing secrets to the browser.
- Invalid external data does not corrupt the primary store.
- Sync behavior is explicit and observable.

## Milestone 5: Hardening And Release Readiness

Goal: prepare the BFF-backed MVP for daily use.

Owner agents:

- Testing Agent
- Observability Agent
- Security & Review Agent
- Documentation Agent
- Release / DevOps Agent

Checklist:

- [ ] `pnpm lint`, `pnpm typecheck`, and the focused automated test suites pass.
- [ ] Playwright smoke coverage stays green for dashboard, filters, details, form
  save, and locale switching.
- [ ] README documents runtime modes, environment variables, and local setup.
- [ ] Architecture docs and ADRs match the implemented BFF model.
- [ ] Release notes capture the in-memory-to-Postgres gap until the adapter lands.
- [ ] Production deploy expectations for the server runtime are documented.

Exit criteria:

- The BFF-backed app is understandable, testable, and safe to evolve.
- Remaining infrastructure gaps are documented and accepted by the Product Owner.

## V2 Candidates

- Multi-user auth and permissions.
- Background sync jobs.
- Conflict detection and optimistic concurrency.
- Audit history.
- Calendar reminders.
- Email/import automation.
- Attachments.
- Advanced analytics.
- Production monitoring.
