# Jobflow Feature Bank

This file is the primary feature intake and feature lifecycle registry.

## Rules

- Every accepted feature gets a unique ID: `FEAT-XXX`.
- IDs are sequential and never reused.
- Feature intake requests such as `new idea: ...`, `запиши идею: ...`, or
  `новая идея: ...` are recorded here.
- Free-form thoughts or ideas without an explicit type are recorded here when
  Codex classifies them as `FEAT`.
- Study or planning starts only from a targeted ID command (`plan FEAT-XXX`,
  `изучи FEAT-XXX`, or `спланируй FEAT-XXX`) and must create or update the
  local spec at `docs/workitems/FEAT-XXX.md`.
- Implementation starts only from a targeted ID command (`implement FEAT-XXX`
  or `реализуй FEAT-XXX`).
- Unless the Product Owner explicitly asks to stop earlier, implementation runs
  the full delivery flow: branch, implementation, checks, commit, PR, squash
  merge to `main`, then return to `main`.
- Text-only study, planning, or implementation requests are allowed only after
  explicit confirmation of the matched feature ID.
- `docs/workitems/FEAT-XXX.md` is a local working spec and must not be added to
  git.
- After merge to `main`, move the local spec to
  `docs/workitems/done/FEAT-XXX.md`.
- A feature is marked `done` only after confirmed production/market release.

## When To Use FEAT

- New capability.
- New user-facing outcome.
- Noticeable product expansion.

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
| FEAT-011 | Replace vacancy select with searchable vacancy field | A plain select control will become hard to use as the vacancy list grows, and users need a faster way to find the right option | Improves scalability and usability of vacancy selection, ideally by reusing a proven Nuxt UI solution if available | High | new | - | - | - | 2026-05-20 |
| FEAT-012 | Reduce desktop header height and keep menu in one row | The desktop header is visually oversized and takes more vertical space than needed | Improves information density and makes the primary navigation feel lighter on desktop screens | Medium | new | - | - | - | 2026-05-20 |

## Operational Notes

- `Branch` is populated when implementation starts and must exactly match the feature ID.
- `PR` stores the merge candidate URL or identifier.
- `Release` stores release evidence (deploy record/tag/build link).
- The local spec path for each feature is `docs/workitems/FEAT-XXX.md`.
- Completed local specs move to `docs/workitems/done/FEAT-XXX.md` after merge.
- Specs under `docs/workitems/` are intentionally local-only and must not be
  staged, committed, or linked as tracked artifacts.
- Move status to `in_review` once the commit exists and the PR is open.
- Move status to `released` after merge and release preparation is complete.
- Move status to `done` only after production deployment is verified.
