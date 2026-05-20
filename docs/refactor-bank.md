# Jobflow Refactor Bank

This file is a legacy read-only snapshot from the pre-GitHub-Issues workflow.
Active refactor intake, planning, and delivery now live in GitHub Issues.

The remaining content in this file is preserved as historical context and may
describe superseded pre-migration rules.

## Rules

- Every accepted refactor gets a unique ID: `REF-XXX`.
- IDs are sequential and never reused within the refactor namespace.
- Refactor intake requests such as `new refactor: ...` or `запиши refactor: ...`
  are recorded here.
- Free-form thoughts or ideas without an explicit type are recorded here when
  Codex classifies them as `REF`.
- Study or planning starts only from a targeted ID command (`plan REF-XXX`,
  `изучи REF-XXX`, or `спланируй REF-XXX`) and must create or update the local
  spec at `docs/workitems/REF-XXX.md`.
- Implementation starts only from a targeted ID command (`implement REF-XXX`
  or `реализуй REF-XXX`).
- Unless the Product Owner explicitly asks to stop earlier, implementation runs
  the full delivery flow: branch, implementation, checks, commit, PR, squash
  merge to `main`, then return to `main`.
- Text-only study, planning, or implementation requests are allowed only after
  explicit confirmation of the matched refactor ID.
- `docs/workitems/REF-XXX.md` is a local working spec and must not be added to
  git.
- After merge to `main`, move the local spec to
  `docs/workitems/done/REF-XXX.md`.
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
| REF-001 | Move stores to Composition API | Current stores still use older patterns and do not align with the preferred Composition API direction | Improves maintainability, consistency, and future refactor safety across state management | Medium | new | - | - | - | 2026-05-20 |
| REF-002 | Evaluate automatic migrations in container build workflow | Container delivery still expects migrations to be run as a separate step, which adds operational overhead and requires a clearer deployment approach | Can simplify deployment workflow if a safe automatic strategy is validated and adopted | Medium | new | - | - | - | 2026-05-20 |
| REF-003 | Centralize repeated strings into constants or enums | Repeated string literals across the codebase increase typo risk, weaken refactor safety, and make shared domain vocabulary harder to enforce | Improves consistency, maintainability, and type safety by moving stable repeated strings into shared constants or enums where appropriate | Medium | new | - | - | - | 2026-05-20 |

## Operational Notes

- `Branch` is populated when implementation starts and must exactly match the refactor ID.
- `PR` stores the merge candidate URL or identifier.
- `Release` stores release evidence (deploy record/tag/build link).
- The local spec path for each refactor is `docs/workitems/REF-XXX.md`.
- Completed local specs move to `docs/workitems/done/REF-XXX.md` after merge.
- Specs under `docs/workitems/` are intentionally local-only and must not be
  staged, committed, or linked as tracked artifacts.
- Move status to `in_review` once the commit exists and the PR is open.
- Move status to `released` after merge and release preparation is complete.
- Move status to `done` only after production deployment is verified.
