# Jobflow Feature Bank

This file is the primary feature intake and feature lifecycle registry.

## Rules

- Every accepted feature gets a unique ID: `FEAT-XXX`.
- IDs are sequential and never reused.
- Feature intake requests such as `new idea: ...`, `запиши идею: ...`, or
  `новая идея: ...` are recorded here.
- Study or planning starts only from a targeted ID command (`plan FEAT-XXX`,
  `изучи FEAT-XXX`, or `спланируй FEAT-XXX`) and must create or update the
  local spec at `docs/features/FEAT-XXX.md`.
- Implementation starts only from a targeted ID command (`implement FEAT-XXX`
  or `реализуй FEAT-XXX`).
- Text-only study, planning, or implementation requests are allowed only after
  explicit confirmation of the matched feature ID.
- `docs/features/FEAT-XXX.md` is a local working spec and must not be added to
  git.
- A feature is marked `done` only after confirmed production/market release.

## Status Lifecycle

`new -> triage -> discovery -> planned -> in_progress -> in_review -> released -> done`

Optional terminal status: `cancelled`.

## Registry

| ID | Title | Problem | Value | Priority | Status | Branch | PR | Release | Updated |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FEAT-001 | Google Sheets import gateway | Need safe one-way import from Sheets into DB-first runtime | Enables planned Sheets integration without exposing secrets | Medium | planned | `FEAT-001` | - | - | 2026-05-19 |
| FEAT-002 | Multi-user auth and permissions | MVP is single-user oriented | Enables team usage with access control | Medium | triage | - | - | - | 2026-05-19 |
| FEAT-003 | Background sync jobs | No async sync orchestration yet | Improves reliability of integrations and reconciliation | Low | new | - | - | - | 2026-05-19 |
| FEAT-004 | Simplify home page and add entity pages | Home page is overloaded and mixes summary with detailed workflows | Improves clarity, focus, and navigation by moving details to dedicated entity pages | High | in_review | `FEAT-004` | - | - | 2026-05-19 |
| FEAT-005 | UI import/export for data | No user-facing way to move data between environments or sessions | Enables portability, manual migration, and safer operational workflows | High | triage | - | - | - | 2026-05-19 |
| FEAT-006 | Backup management workflow | Backup capability exists operationally but not as a productized feature flow | Improves resilience and recovery confidence for operators | High | triage | - | - | - | 2026-05-19 |
| FEAT-007 | Service usage guide page | No built-in end-user instruction page exists in the app | Reduces onboarding time and support load with a dedicated in-product guide | Medium | new | - | - | - | 2026-05-19 |
| FEAT-008 | Mobile-first UI baseline | Current UI is not explicitly optimized from mobile-first constraints | Improves usability and conversion on phones and small screens | High | in_review | `FEAT-008` | - | - | 2026-05-19 |
| FEAT-009 | Text audit and copy cleanup | Product copy still contains outdated terms (e.g., Google Sheets, mock wording) | Aligns UX language with actual runtime and improves trust | High | in_review | `FEAT-009` | - | - | 2026-05-19 |
| FEAT-010 | Presentable home page with product value | Home page needs a stronger presentation layer and value proposition | Improves first impression, clarity, and product positioning | High | new | - | - | - | 2026-05-19 |

## Operational Notes

- `Branch` is populated when implementation starts and must exactly match the feature ID.
- `PR` stores the merge candidate URL or identifier.
- `Release` stores release evidence (deploy record/tag/build link).
- The local spec path for each feature is `docs/features/FEAT-XXX.md`.
- Specs under `docs/features/` are intentionally local-only and must not be
  staged, committed, or linked as tracked artifacts.
- Move status to `released` after merge and release preparation is complete.
- Move status to `done` only after production deployment is verified.
