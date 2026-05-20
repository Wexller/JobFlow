# Jobflow Refactor Bank

This file is the primary refactor intake and lifecycle registry.

## Rules

- Every accepted refactor gets a unique ID: `REF-XXX`.
- IDs are sequential and never reused within the refactor namespace.
- Refactor intake requests such as `new refactor: ...` or `запиши refactor: ...`
  are recorded here.
- Study or planning starts only from a targeted ID command (`plan REF-XXX`,
  `изучи REF-XXX`, or `спланируй REF-XXX`) and must create or update the local
  spec at `docs/workitems/REF-XXX.md`.
- Implementation starts only from a targeted ID command (`implement REF-XXX`
  or `реализуй REF-XXX`).
- Text-only study, planning, or implementation requests are allowed only after
  explicit confirmation of the matched refactor ID.
- `docs/workitems/REF-XXX.md` is a local working spec and must not be added to
  git.
- A refactor is marked `done` only after confirmed production/market release.

## Status Lifecycle

`new -> triage -> discovery -> planned -> in_progress -> in_review -> released -> done`

Optional terminal status: `cancelled`.

## When To Use REF

- Structural improvement without adding a new user-facing capability.
- Module, boundary, or architecture cleanup.
- Maintainability, readability, or internal performance improvement that keeps
  intended behavior the same.

## Registry

| ID | Title | Problem | Value | Priority | Status | Branch | PR | Release | Updated |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Operational Notes

- `Branch` is populated when implementation starts and must exactly match the refactor ID.
- `PR` stores the merge candidate URL or identifier.
- `Release` stores release evidence (deploy record/tag/build link).
- The local spec path for each refactor is `docs/workitems/REF-XXX.md`.
- Specs under `docs/workitems/` are intentionally local-only and must not be
  staged, committed, or linked as tracked artifacts.
- Move status to `released` after merge and release preparation is complete.
- Move status to `done` only after production deployment is verified.
