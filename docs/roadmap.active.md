# Jobflow Active Roadmap

This is the only active roadmap for regular planning and delivery tracking.

`docs/roadmap.md` is legacy reference and should be used only by explicit Product Owner request.

## Planning Sources

- Unfinished roadmap items migrated from legacy roadmap.
- Planned and in-progress items from `docs/idea-bank.md`.

## Near Term

### Milestone A: Google Sheets Import And Sync (deferred -> active when approved)

Goal: enable safe server-side Google Sheets import without restoring Sheets as primary runtime source.

Checklist:

- [ ] Define the server-side Google Sheets gateway contract.
- [ ] Add one-way import from Google Sheets into the primary store.
- [ ] Add data quality warnings for invalid dates, numbers, headers, and enum values.
- [ ] Add explicit reconciliation rules and source-of-truth guidance.
- [ ] Add safe logging around import and sync failures.
- [ ] Add test fixtures and mocked coverage for malformed Sheets rows.
- [ ] Document Google Sheets sync setup and operator workflow.

Exit criteria:

- Sheets import is server-side and does not expose secrets to browser code.
- Invalid external data cannot corrupt primary Postgres data.
- Sync behavior is explicit and observable.

## Next

### From Idea Bank

- [ ] IDEA-001 Google Sheets import gateway (`planned`)
- [ ] IDEA-002 Multi-user auth and permissions (`triage`)
- [ ] IDEA-003 Background sync jobs (`new`)
- [ ] IDEA-004 Simplify home page and add entity pages (`in_review`)
- [ ] IDEA-005 UI import/export for data (`triage`)
- [ ] IDEA-006 Backup management workflow (`triage`)
- [ ] IDEA-007 Service usage guide page (`new`)
- [ ] IDEA-008 Mobile-first UI baseline (`in_review`)
- [ ] IDEA-009 Text audit and copy cleanup (`in_review`)
- [ ] IDEA-010 Presentable home page with product value (`new`)

## Backlog Candidates

- Conflict detection and optimistic concurrency.
- Audit history.
- Calendar reminders.
- Email/import automation.
- Attachments.
- Advanced analytics.
- Production monitoring.

## Delivery Policy

- Any roadmap item that maps to a feature must have a corresponding `IDEA-xxx` entry.
- Feature development branch must match feature ID exactly (`IDEA-xxx`).
- Merge policy is squash merge to `main`.
- Feature is marked done only after confirmed production release and corresponding status updates in `docs/idea-bank.md`.
