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
- Unless the Product Owner explicitly asks to stop earlier, implementation runs
  the full delivery flow: branch, implementation, checks, commit, PR, squash
  merge to `main`, then return to `main`.
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
| FIX-001 | Make the main page table usable on mobile | The main table does not fit on mobile screens and is currently hard or impossible to use there | Restores expected mobile usability for one of the core home screen workflows | High | new | - | - | - | 2026-05-20 |
| FIX-002 | Fix home screen next actions responsiveness | The next actions block on the home screen is not adaptive on mobile layouts | Restores expected responsive behavior and prevents layout breakage on small screens | High | new | - | - | - | 2026-05-20 |
| FIX-003 | Restore mobile spacing between page blocks | Multiple pages currently have missing vertical spacing between blocks on mobile layouts | Improves readability, visual hierarchy, and baseline mobile polish across the app | High | new | - | - | - | 2026-05-20 |
| FIX-004 | Use two-column dashboard stats on 375px mobile screens | The main dashboard stats area does not use available width efficiently on mobile screens wide enough for a denser layout | Improves information density and readability on common mobile widths without waiting for a larger redesign | Medium | new | - | - | - | 2026-05-20 |

## Operational Notes

- `Branch` is populated when implementation starts and must exactly match the fix ID.
- `PR` stores the merge candidate URL or identifier.
- `Release` stores release evidence (deploy record/tag/build link).
- The local spec path for each fix is `docs/workitems/FIX-XXX.md`.
- Specs under `docs/workitems/` are intentionally local-only and must not be
  staged, committed, or linked as tracked artifacts.
- Move status to `in_review` once the commit exists and the PR is open.
- Move status to `released` after merge and release preparation is complete.
- Move status to `done` only after production deployment is verified.
