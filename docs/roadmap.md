# Jobflow Roadmap

This roadmap is the working delivery plan for the MVP. It is intentionally
organized as vertical slices so the product becomes usable early and stays
covered by tests.

## Current Baseline

- Agent operating model is documented.
- Nuxt 4 scaffold is created.
- English and Russian i18n are configured with browser locale detection.
- Nuxt UI v4, Pinia, VueUse, Zod, Vitest, Playwright, and ECharts dependencies
  are installed.
- Remote font providers are disabled to keep local builds independent from
  external font metadata.
- `pnpm test:ci` passes on Node.js 24.

## Milestone 1: Foundation Hardening

Goal: make the scaffold a reliable base for feature work.

Owner agents:

- Solution Architect Agent
- Data & State Agent
- Testing Agent
- Security & Review Agent

Checklist:

- [x] Nuxt 4 scaffold committed.
- [x] English/Russian locale files created.
- [x] README documents stack, commands, and environment variables.
- [x] Add `.nvmrc` with the active Node.js version.
- [x] Add Nuxt component test example under `tests/nuxt`.
- [x] Add basic app smoke e2e test to CI checklist.
- [x] Add a lightweight logger and redaction utility.
- [x] Add typed result/error utility.
- [x] Confirm `pnpm test:ci` and `pnpm dev` with `nvm use`.

Exit criteria:

- `pnpm test:ci` passes.
- Local dev startup is documented and verified.
- No generated/cached files are tracked.
- README and architecture docs match actual project structure.

## Milestone 2: Domain And Mock Data Layer

Goal: model the job-search CRM domain without touching live Google Sheets yet.

Owner agents:

- Product / Domain Agent
- Data & State Agent
- Testing Agent
- Security & Review Agent

Checklist:

- [x] Define stable enum IDs for vacancy statuses, priorities, formats, stages,
  stage statuses, interview results, and offer decisions.
- [x] Add Zod schemas for `Vacancy`, `PipelineEvent`, `Interview`, `Offer`, and
  `SummaryMetric`.
- [x] Add mappers for form payloads and normalized domain objects.
- [ ] Add mock repository with realistic fixture data.
- [ ] Add Pinia stores for vacancies, pipeline, interviews, offers, filters, and
  sync state.
- [ ] Add unit tests for schemas, normalization, selectors, filters, sorting, and
  dashboard metrics.

Exit criteria:

- UI can read from mock repositories.
- Domain data uses stable IDs, never localized labels.
- Unit coverage exists for core domain rules.

## Milestone 3: First Usable Prototype

Goal: deliver a local CRM experience backed by mock data.

Owner agents:

- Frontend UI Agent
- Data & State Agent
- Testing Agent
- Observability Agent
- Security & Review Agent

Checklist:

- [ ] Dashboard shows total applications, active processes, interviews this week,
  offers, reply rate, interview rate, offer rate, and next actions.
- [ ] Vacancies table supports filters by status, source, priority, format,
  level, location, and tech stack.
- [ ] Vacancies table supports sorting by date applied, priority, match score,
  and salary.
- [ ] Kanban groups vacancies by current status.
- [ ] Vacancy details show main info, pipeline timeline, interviews, offer, notes,
  and next step.
- [ ] Add/edit vacancy form validates required fields.
- [ ] Loading, empty, error, and success states are present.
- [ ] Component and e2e tests cover the main happy path.

Exit criteria:

- A user can manage the job-search workflow locally using mock data.
- The first prototype is responsive and localized in English/Russian.

## Milestone 4: Google Sheets Read Integration

Goal: load real data from Google Sheets safely.

Owner agents:

- Google Sheets Platform Agent
- Data & State Agent
- Testing Agent
- Observability Agent
- Security & Review Agent

Checklist:

- [ ] Add Google Identity Services client-only integration.
- [ ] Add Sheets REST client using access tokens kept in memory.
- [ ] Add range definitions for all MVP tabs.
- [ ] Add row DTOs and row-to-domain mappers.
- [ ] Add read-only `batchGet` loading flow.
- [ ] Add data quality warnings for missing headers, invalid dates, invalid
  numbers, and unknown enum values.
- [ ] Add MSW-backed integration tests for Sheets responses.
- [ ] Document Google Cloud OAuth setup in README or dedicated setup guide.

Exit criteria:

- The app can load the existing sheet in read-only mode.
- Invalid sheet data does not crash the UI.
- No secrets or tokens are logged.

## Milestone 5: Google Sheets Write Integration

Goal: support CRUD operations required for the MVP.

Owner agents:

- Google Sheets Platform Agent
- Data & State Agent
- Frontend UI Agent
- Testing Agent
- Observability Agent
- Security & Review Agent

Checklist:

- [ ] Add create/update vacancy operations.
- [ ] Add create/update pipeline event operations.
- [ ] Add create/update interview operations.
- [ ] Add create/update offer operations.
- [ ] Use stable IDs for updates; do not expose row numbers to UI.
- [ ] Avoid physical row deletion in MVP; use archive/status behavior instead.
- [ ] Add retry/backoff handling for quota and transient failures.
- [ ] Add audit logging for write actions without sensitive field values.
- [ ] Add integration tests for create/update mapping.

Exit criteria:

- A user can use the app as the primary interface over Google Sheets.
- Write failures are recoverable and visible.
- Data corruption risks are minimized by validation and mapping tests.

## Milestone 6: MVP Release Candidate

Goal: prepare the personal MVP for daily use.

Owner agents:

- Testing Agent
- Observability Agent
- Security & Review Agent
- Documentation Agent
- Release / DevOps Agent

Checklist:

- [ ] Full `pnpm test:ci` passes.
- [ ] Playwright smoke tests cover dashboard, vacancies table, kanban, vacancy
  details, and add/edit flow.
- [ ] Manual smoke test with a copied Google Sheet passes.
- [ ] README contains setup, Google Cloud OAuth, env variables, commands, and
  troubleshooting.
- [ ] Security review confirms no private secrets are exposed.
- [ ] Release checklist and rollback notes are documented.

Exit criteria:

- The app is usable as a personal job-search CRM.
- Remaining risks are documented and accepted by the Product Owner.

## V2 Candidates

- Custom backend or BFF.
- Multi-user accounts and permissions.
- Database migration from Google Sheets.
- Audit history and optimistic concurrency.
- Calendar reminders.
- Email/import automation.
- Attachments.
- Advanced analytics.
- Production monitoring.
