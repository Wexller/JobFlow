# Jobflow Idea Bank

This file is the primary idea intake and feature lifecycle registry.

## Rules

- Every accepted idea gets a unique ID: `IDEA-xxx`.
- IDs are sequential and never reused.
- Implementation starts only from a targeted ID command (`implement IDEA-xxx` or `реализуй IDEA-xxx`).
- Text-only implementation request is allowed only after explicit confirmation of the matched idea ID.
- A feature is marked `done` only after confirmed production/market release.

## Status Lifecycle

`new -> triage -> discovery -> planned -> in_progress -> in_review -> released -> done`

Optional terminal status: `cancelled`.

## Registry

| ID | Title | Problem | Value | Priority | Status | Branch | PR | Release | Updated |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IDEA-001 | Google Sheets import gateway | Need safe one-way import from Sheets into DB-first runtime | Enables planned Sheets integration without exposing secrets | Medium | planned | `IDEA-001` | - | - | 2026-05-19 |
| IDEA-002 | Multi-user auth and permissions | MVP is single-user oriented | Enables team usage with access control | Medium | triage | - | - | - | 2026-05-19 |
| IDEA-003 | Background sync jobs | No async sync orchestration yet | Improves reliability of integrations and reconciliation | Low | new | - | - | - | 2026-05-19 |
| IDEA-004 | Simplify home page and add entity pages | Home page is overloaded and mixes summary with detailed workflows | Improves clarity, focus, and navigation by moving details to dedicated entity pages | High | in_progress | `IDEA-004` | - | - | 2026-05-19 |
| IDEA-005 | UI import/export for data | No user-facing way to move data between environments or sessions | Enables portability, manual migration, and safer operational workflows | High | triage | - | - | - | 2026-05-19 |
| IDEA-006 | Backup management workflow | Backup capability exists operationally but not as a productized feature flow | Improves resilience and recovery confidence for operators | High | triage | - | - | - | 2026-05-19 |

## Operational Notes

- `Branch` is populated when implementation starts and must exactly match the feature ID.
- `PR` stores the merge candidate URL or identifier.
- `Release` stores release evidence (deploy record/tag/build link).
- Move status to `released` after merge and release preparation is complete.
- Move status to `done` only after production deployment is verified.
