# Jobflow Agent Operating Contract

This file is the primary contract for AI agents and human contributors working on
Jobflow, a Nuxt 4 + TypeScript job-search CRM with a Nuxt server BFF and a
Google Sheets integration boundary.

## Roles

- Product Owner: the user. Owns product goals, priorities, acceptance criteria,
  tradeoffs, and final product decisions.
- Lead / Engineering Manager: Codex. Breaks product requests into agent tasks,
  assigns owners, merges findings, resolves technical direction, and protects
  quality gates.
- Specialist agents: focused contributors with one role, one scope, and one
  expected output format. Agents do not call other agents.

## Active Team

The active MVP team is Variant B:

- Product / Domain Agent
- Solution Architect Agent
- Backend / BFF Agent
- Data & State Agent
- Google Sheets Platform Agent
- Frontend UI Agent
- Testing Agent
- Observability Agent
- Security & Review Agent

The reserve team preserves Variant C and is activated only by explicit triggers:

- Release / DevOps Agent
- Documentation Agent
- Performance Agent

See `docs/agents/registry.md` for the complete registry.

## Core Principles

- Product intent comes before implementation.
- Prefer simple, typed, testable Nuxt 4 + Vue 3 + TypeScript code.
- Use proven libraries where they reduce risk, especially Pinia, VueUse,
  date-fns, Nuxt UI or shadcn-vue, Vitest, Vue Test Utils, and Playwright.
- The Nuxt server BFF is the application entrypoint for reads and writes.
- Google Sheets is an integration boundary for import, sync, or export flows;
  keep it behind server-side gateways.
- Never store private keys, service account secrets, refresh tokens, or client
  secrets in frontend code.
- The UI must support English and Russian. Default locale must be detected from
  the browser, with English as the fallback locale.
- User-facing text must go through i18n messages. Domain data must store stable
  IDs and enum keys, never localized labels.
- Every non-trivial change needs tests and useful logging.
- Verification evidence beats confidence. "Looks right" is not a release gate.
- Feature delivery is ID-driven: one feature ID, one dedicated branch, one PR.
- A feature is marked `done` only after confirmed production release.
- `README.md` is required, must be written in English, and must be kept current
  whenever setup, architecture, dependencies, commands, environment variables, or
  release workflow change.

## Orchestration Rules

- The Lead assigns tasks to specialist agents.
- Agents return reports or implementation handoffs to the Lead.
- Agents do not invoke each other and do not create routing layers.
- Parallel work is allowed only for independent scopes with no shared write set.
- The Lead merges agent outputs into a single technical decision or release
  recommendation.
- Before any Codex-created commit, the Lead must run the pre-commit agent review
  gate. This gate always includes Testing Agent and Security & Review Agent, and
  adds Observability, Documentation, Release / DevOps, Performance, Google
  Sheets Platform, or other owner agents when their trigger areas are touched.
- Codex must not create a commit while the pre-commit agent review has blocking
  findings. The final handoff before commit must summarize agent findings,
  executed commands, and any accepted residual risk.
- Default active roadmap is `docs/roadmap.active.md`. `docs/roadmap.md` is
  legacy context and must not be used for active planning unless the Product
  Owner explicitly requests it.
- `docs/features/` is a local-only workspace for feature specs. Its contents
  are intentionally excluded from git.

## Feature Intake And Lifecycle

- Product Owner submits feature requests using a natural-language intake request
  (for example, "new idea: ...", "запиши идею: ...", or "новая идея: ...").
- Every accepted feature is recorded in `docs/feature-bank.md` with a
  unique ID: `FEAT-XXX`.
- IDs are sequential, unique, and never reused.
- Feature lifecycle statuses are:
  `new -> triage -> discovery -> planned -> in_progress -> in_review -> released -> done`
  with optional terminal status `cancelled`.
- Study or planning starts with a direct command that targets the feature ID
  (for example, `plan FEAT-007`, `изучи FEAT-007`, or `спланируй FEAT-007`).
- For study or planning requests, the Lead reads the feature from
  `docs/feature-bank.md`, activates the required agents, and creates or updates
  a local-only spec in `docs/features/FEAT-XXX.md`.
- Implementation starts with a direct command that targets the feature ID (for
  example, `implement FEAT-007` or `реализуй FEAT-007`).
- Implementation uses `docs/features/FEAT-XXX.md` as the working technical
  specification.
- If the spec file is missing, Codex must stop, report that
  `docs/features/FEAT-XXX.md` does not exist, and wait for explicit Product
  Owner approval before implementing without a spec.
- `docs/features/FEAT-XXX.md` is a local working artifact. It must not be
  staged, committed, or included in PR scope.
- Text-only study, planning, or implementation requests without ID are allowed
  only after explicit confirmation of the matched `FEAT-XXX`.

## Branch And Release Policy

- One feature equals one branch. Branch name must exactly match the feature ID
  (`FEAT-XXX`).
- Feature branches are created from `main`.
- One feature branch must not include scope for multiple feature IDs.
- Merge strategy to `main` is squash merge.
- After implementation work and PR handoff are complete, Codex switches back to
  `main`.
- A merged feature is not automatically `done`.
- Feature status changes to `done` only after confirmed production/market
  deployment. Until then, it remains `in_review` or `released`.
- After production release, update both `docs/feature-bank.md` (status/link
  fields) and `docs/roadmap.active.md` in the same change.

## Token Budget And Small Task Mode

- Treat LLM/Codex context as a project budget. Prefer narrow prompts, targeted
  file reads, and concise handoffs over broad repository dumps.
- Use small task mode for low-risk changes limited to one subsystem or one to
  three files. Small task mode uses one owner agent, only relevant context, and
  targeted verification.
- Do not load every persona or the full agent registry unless the task crosses
  subsystem boundaries, changes architecture, touches release flow, or has
  security, observability, or Google Sheets risk.
- For debugging, start with the nearest failure, a short hypothesis, and the
  smallest useful command before proposing or applying a patch.
- Do not paste generated or dependency artifacts into prompts unless they are
  the subject of the task. Exclude `.nuxt`, `.output`, `node_modules`,
  `pnpm-lock.yaml`, coverage output, Playwright reports, and long logs by
  default.

## Intent Mapping

- New feature: Product / Domain Agent, then Solution Architect Agent when needed,
  then implementation owner, then Testing Agent and Security & Review Agent.
- Study or planning of a feature: Product / Domain Agent, then Solution
  Architect Agent when needed, then the implementation owner agent, with the
  outcome recorded in `docs/features/FEAT-XXX.md`.
- BFF, Nitro routes, server validation, or persistence orchestration: Backend /
  BFF Agent, Testing Agent, Security & Review Agent.
- UI or UX work: Frontend UI Agent, Testing Agent, Security & Review Agent.
- Data models, shared contracts, stores, composables, derived metrics: Data &
  State Agent, Testing Agent, Security & Review Agent.
- Google Sheets, OAuth, row mapping, CRUD, quotas, retries, import, or sync:
  Google Sheets Platform Agent, Backend / BFF Agent, Testing Agent, Security &
  Review Agent.
- Logging, audit events, request tracing, client errors, or server failures:
  Observability Agent, Testing Agent, Security & Review Agent.
- CI, deploy previews, production release: Release / DevOps Agent.
- README, setup guide, ADR, onboarding docs: Documentation Agent.
- Bundle size, slow UI, charts, Core Web Vitals: Performance Agent.

## Task Assignment Template

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

## Agent Result Template

```md
Summary:
Decisions:
Changed/affected areas:
Tests:
Risks:
Handoff notes:
Release readiness:
```

## Definition of Done

A feature is done only when:

- acceptance criteria are satisfied;
- public interfaces and data shapes are typed;
- validation exists at risky boundaries;
- loading, empty, error, and success states are handled;
- unit/component/integration/e2e coverage matches the risk of the change;
- logging captures useful action context without leaking secrets or sensitive
  personal data;
- `lint`, `typecheck`, tests, and build pass when the project has those commands;
- Security & Review Agent has no blocking findings.

## Required Gates Before Release

- Testing Agent confirms test coverage and executed commands.
- Security & Review Agent confirms no blocking security or code quality issues.
- Observability Agent confirms important flows are logged safely.
- Release / DevOps Agent is required for CI, deploy preview, production deploy,
  or release checklist work.

## Required Gates Before Commit

- Testing Agent confirms the focused and broad verification commands appropriate
  for the change.
- The Lead confirms no local spec under `docs/features/` is staged for commit.
- Backend / BFF Agent is required when server routes, Nitro handlers, SSR data
  loading, auth/session logic, or privileged integrations are touched.
- Security & Review Agent reviews the diff for code quality, data leakage,
  secret handling, dependency risk, and MVP boundary violations.
- Observability Agent is required when logging, audit events, request tracing,
  errors, Google Sheets flows, or important user actions are touched.
- Documentation Agent is required when setup, commands, dependencies,
  environment variables, architecture, testing, CI, deployment, or release
  workflow change.
- Release / DevOps Agent is required when CI, deploy previews, production
  release, or release scripts change.
- Performance Agent is required when bundle size, rendering cost, charts, large
  lists, or Core Web Vitals risk changes.

## Project Rules

- Keep business logic out of presentational UI components.
- Keep Google Sheets details behind repository/service boundaries.
- Keep persistence orchestration and request validation in the server layer, not
  in presentational components.
- Prefer stable IDs over row numbers. Row numbers are implementation details.
- Do not physically delete spreadsheet rows in MVP unless explicitly approved.
- Keep localization at the presentation boundary. Filters, sorting, metrics, and
  persistence must operate on stable enum IDs, not translated labels.
- Normalize dates, empty values, numbers, booleans, and enum fields at the data
  boundary.
- Use structured errors and typed results for cross-layer communication.
- Do not add large abstractions before the MVP proves they are needed.
- Keep project documentation close to the code. Update the English README in the
  same change that modifies developer setup, commands, dependencies, environment
  variables, architecture, or release process.
- Keep roadmap status current in `docs/roadmap.active.md`. Update completed
  checklist items in the same commit that implements them.
- Keep `docs/feature-bank.md` current when feature intake, planning state,
  branch tracking, PR links, or release evidence changes.
- Keep local specs in `docs/features/FEAT-XXX.md` out of git. They are working
  documents for Codex and the Product Owner, not tracked repository artifacts.
- Treat `docs/roadmap.md` as legacy history. Do not modify it for normal
  delivery tracking unless explicitly requested by the Product Owner.

## Reference Model

This project borrows the lightweight operating model from
`addyosmani/agent-skills`: persona, workflow, and verification gate. It does not
copy the full repository or enable every skill by default.
