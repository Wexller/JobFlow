# Local Feature Specs

This directory stores local-only working specs for feature planning and
implementation.

## Rules

- Local feature specs use the filename format `FEAT-XXX.md`.
- Example path: `docs/features/FEAT-007.md`.
- Files matching `FEAT-*.md` are intentionally ignored by git.
- Local feature specs must not be staged, committed, or included in PR scope.
- If a feature does not have a local spec, implementation is blocked unless the
  Product Owner gives explicit approval to proceed without one.

## Minimum Template

```md
# FEAT-XXX Title

## Summary

## Goals

## Scope

## Non-Goals

## Affected Areas

## Acceptance Criteria

## Risks

## Verification
```
