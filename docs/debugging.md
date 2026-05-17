# Debugging Guide

This guide keeps Jobflow debugging focused, repeatable, and token-efficient.

## Debug Handoff

Use this shape when handing a failure to an agent or teammate:

```md
Goal:
Scope:
Command:
Expected:
Actual:
Relevant files:
Log excerpt:
What changed recently:
```

Keep the scope to one subsystem or one to three files when practical. Include
the last 30-80 relevant log lines, not the full terminal history.

## First Checks

- Start with the nearest failing command before running the full CI suite.
- Use `rg` for focused code search.
- Use one spec or one test directory before broad test runs.
- Prefer `pnpm typecheck` for type failures.
- Prefer `pnpm test:unit` for utilities, schemas, mappers, stores, and
  composables.
- Use `pnpm test:e2e` for browser workflow failures after unit and component
  checks are already localized.
- Use `pnpm test:ci` after localized checks pass or before release readiness.

## Context Hygiene

Do not paste these into prompts unless directly relevant:

- `.nuxt`
- `.output`
- `node_modules`
- `pnpm-lock.yaml`
- coverage output
- Playwright reports
- full build logs
- full private spreadsheet data

For UI issues, include the viewport, a screenshot, expected behavior, and actual
behavior. For Google Sheets issues, include tab names, headers, and two or three
fixture rows with sensitive values removed.

## Patch Discipline

Before changing code, identify the smallest plausible cause and the smallest
verification command. After changing code, run the narrowest meaningful check
first, then broaden verification only as risk grows.
