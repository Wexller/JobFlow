# Agent Operating Model

This document defines how the Product Owner, Lead, and specialist agents work
together from request intake to release.

## Lifecycle

1. Intake
   - Product Owner describes the outcome, priority, constraints, and success
     criteria.
   - Accepted features are registered in `docs/feature-bank.md` with unique
     IDs (`FEAT-XXX`).
   - Accepted refactors are registered in `docs/refactor-bank.md` with unique
     IDs (`REF-XXX`).
   - Accepted fixes are registered in `docs/fix-bank.md` with unique IDs
     (`FIX-XXX`).
   - Lead identifies the owner agent, required reviewers, and whether reserve
     agents are needed.

2. Discovery
   - Owner agent studies only relevant context.
   - Discoverable facts are resolved from the repository before asking the
     Product Owner.
   - Product or tradeoff questions are escalated to the Product Owner.
   - Generated artifacts, dependency folders, lockfiles, coverage reports,
     Playwright reports, and long logs are excluded unless directly relevant.

3. Specification
   - Product / Domain Agent is used when behavior, user flows, or acceptance
     criteria are not yet clear.
   - Solution Architect Agent is used when module boundaries, dependencies, or
     long-term maintainability are affected.
   - Backend / BFF Agent is used when the Nuxt server boundary, request
     contracts, or persistence orchestration are affected.
   - The Lead records planning output in `docs/workitems/<ID>.md`.
   - `docs/workitems/<ID>.md` is a local-only working spec, not a git-tracked
     artifact.
   - Minimum spec structure: summary, goals, scope, non-goals, affected areas,
     acceptance criteria, risks, verification.

4. Implementation
   - Work is split into small vertical slices.
   - Each slice has one owner and a clear write scope.
   - Shared contracts are updated before dependent UI work begins.
   - Implementation reads from `docs/workitems/<ID>.md`.
   - If the spec file does not exist, the Lead stops and asks the Product Owner
     for explicit approval before implementing without a spec.
   - Work item implementation branch must be created from `main` and match the
     work item ID exactly (`FEAT-XXX`, `REF-XXX`, or `FIX-XXX`).
   - One work item branch must not include scope for multiple work item IDs.

5. Verification
   - Testing Agent defines and verifies the test strategy.
   - Observability Agent verifies logging for important flows.
   - Security & Review Agent performs final code and security review.
   - Before any Codex-created commit, the Lead runs the pre-commit agent review
     gate and resolves all blocking findings.
   - The Lead verifies that no file from `docs/workitems/` is staged for commit.

6. Release
   - Release / DevOps Agent joins only for CI, deploy preview, production deploy,
     release checklist, or rollback planning.
   - The Lead merges reports and gives a go/no-go recommendation.
   - Merge policy to `main` is squash merge.
   - After PR handoff is complete, Codex switches back to `main`.
   - Work item status moves to `done` only after confirmed production
     deployment.

## Assignment Template

```md
Role:
Task:
Scope:
Out of scope:
Inputs:
Expected output:
Files/areas:
Quality gates:
Definition of Done:
Open questions:
```

## Result Template

```md
Summary:
Decisions:
Changed/affected areas:
Tests:
Risks:
Handoff notes:
Release readiness:
```

## Required Review Paths

- Small task mode:
  One owner agent -> targeted verification

- Feature touching UI only:
  Frontend UI Agent -> Testing Agent -> Security & Review Agent

- Feature touching domain logic:
  Product / Domain Agent -> Data & State Agent -> Testing Agent -> Security &
  Review Agent

- Feature touching Google Sheets or OAuth:
  Google Sheets Platform Agent -> Backend / BFF Agent -> Testing Agent ->
  Observability Agent -> Security & Review Agent

- Feature touching BFF routes or server persistence:
  Backend / BFF Agent -> Testing Agent -> Security & Review Agent

- Feature touching architecture or dependencies:
  Solution Architect Agent -> Testing Agent -> Security & Review Agent

- Refactor touching architecture or boundaries:
  Solution Architect Agent -> owner agent -> Testing Agent -> Security &
  Review Agent

- Fix touching a localized subsystem:
  nearest owner agent -> Testing Agent -> Security & Review Agent

- Release or deployment:
  Testing Agent -> Security & Review Agent -> Release / DevOps Agent

Use small task mode for low-risk documentation, style, copy, or localized test
fixes limited to one subsystem or one to three files. Leave small task mode when
the task crosses subsystem boundaries, changes public interfaces, touches Google
Sheets or OAuth, changes architecture or dependencies, or introduces security,
observability, release, or data integrity risk.

## Pre-Commit Agent Review

Codex must run this gate automatically before creating any commit:

- Testing Agent reviews the changed surface, confirms the required verification
  commands, and reports test gaps or residual risk.
- Security & Review Agent reviews the diff for correctness, security, privacy,
  secret handling, dependency risk, and project-rule violations.
- Observability Agent joins when logging, audit events, errors, Google Sheets
  flows, sync state, server request tracing, or important user actions are
  touched.
- Documentation Agent joins when README, setup, commands, dependencies,
  environment variables, architecture, testing, CI, deployment, or release
  workflow changes.
- Release / DevOps Agent joins when CI, deploy previews, production release,
  release scripts, or rollback workflow changes.
- Performance Agent joins when bundle size, rendering performance, charts, large
  lists, or Core Web Vitals risk changes.

The Lead must not commit with unresolved blocking findings. The pre-commit
handoff must include the agent review summary, executed commands, and accepted
non-blocking risks. It must also confirm that local specs under `docs/workitems/`
are not staged.

## Token Budget Rules

- Treat LLM/Codex tokens as a shared engineering budget.
- Define scope before implementation: one subsystem or one to three files when
  practical, explicit out-of-scope items, expected output format, and the
  smallest useful verification command.
- Owner agents study only relevant files and commands. Use targeted search and
  reads before expanding context.
- Do not paste generated or dependency artifacts into prompts unless they are
  the subject of the task: `.nuxt`, `.output`, `node_modules`,
  `pnpm-lock.yaml`, coverage output, Playwright reports, and build artifacts are
  excluded by default.
- For failures, share the command, expected result, actual result, and the last
  30-80 relevant log lines instead of full command output.
- For debugging, ask for or provide the nearest cause hypothesis and the minimum
  check before patching.
- Use narrow commands first, such as a single spec, `pnpm test:unit`,
  `pnpm typecheck`, or a focused `rg`. Run `pnpm test:ci` only after localized
  checks pass or before release.
- For UI debugging, provide a screenshot, viewport, expected behavior, and
  actual behavior instead of a broad visual description.
- For Google Sheets work, provide sheet/tab schemas and two or three fixture
  rows instead of full private spreadsheets.
- Reviews should lead with findings only. Avoid restating the full architecture
  unless the architecture is the subject of the review.

## Quality Gates

- Lint: no new lint errors.
- Typecheck: no TypeScript errors.
- Unit tests: required for utilities, mappers, stores, and composables.
- Component tests: required for complex forms, tables, kanban, and timeline UI.
- Integration tests: required for Google Sheets mapping and repository behavior.
- E2E smoke: required for critical MVP flows.
- Build: required before release.

## Logging Rules

- Log action type, entity type, entity ID, request ID, status, duration, and
  sanitized error category.
- Do not log OAuth tokens, refresh tokens, client secrets, service account
  secrets, full spreadsheet cell contents, private notes, or personal contact
  details.
- User-facing errors should be understandable. Internal logs should be
  actionable.

## Reserve Agent Preservation

Variant C is preserved through reserve personas and activation triggers:

- Release / DevOps Agent is activated for CI and release work.
- Documentation Agent is activated for setup, onboarding, ADRs, and durable docs.
- Performance Agent is activated for measurable performance risk.

Reserve agents remain documented even when inactive so the project can scale
without redesigning the operating model.

## README Rule

`README.md` is a required project artifact and must be written in English. Update
it in the same change that modifies setup, commands, dependencies, architecture,
environment variables, Google Cloud or Google Sheets configuration, testing, CI,
deployment, or release workflow.
