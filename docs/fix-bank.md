# Jobflow Fix Bank

This file is the primary fix intake and lifecycle registry.

## Rules

- Every accepted fix gets a unique ID: `FIX-XXX`.
- IDs are sequential and never reused within the fix namespace.
- Fix intake requests such as `new fix: ...` or `запиши fix: ...` are recorded
  here.
- Free-form thoughts or ideas without an explicit type are recorded here when
  Codex classifies them as `FIX`.
- Study or planning starts only from a targeted ID command (`plan FIX-XXX`,
  `изучи FIX-XXX`, or `спланируй FIX-XXX`) and must create or update the local
  spec at `docs/workitems/FIX-XXX.md`.
- Implementation starts only from a targeted ID command (`implement FIX-XXX`
  or `реализуй FIX-XXX`).
- Text-only study, planning, or implementation requests are allowed only after
  explicit confirmation of the matched fix ID.
- `docs/workitems/FIX-XXX.md` is a local working spec and must not be added to
  git.
- A fix is marked `done` only after confirmed production/market release.

## Status Lifecycle

`new -> triage -> discovery -> planned -> in_progress -> in_review -> released -> done`

Optional terminal status: `cancelled`.

## When To Use FIX

- Defect, regression, or incorrect behavior.
- Recovery of expected behavior.
- Production issue, test-proven bug, or high-risk edge-case failure.

## Registry

| ID | Title | Problem | Value | Priority | Status | Branch | PR | Release | Updated |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Operational Notes

- `Branch` is populated when implementation starts and must exactly match the fix ID.
- `PR` stores the merge candidate URL or identifier.
- `Release` stores release evidence (deploy record/tag/build link).
- The local spec path for each fix is `docs/workitems/FIX-XXX.md`.
- Specs under `docs/workitems/` are intentionally local-only and must not be
  staged, committed, or linked as tracked artifacts.
- Move status to `released` after merge and release preparation is complete.
- Move status to `done` only after production deployment is verified.
