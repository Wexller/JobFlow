# Jobflow Agent Operating Contract

This file is the primary contract for AI agents and human contributors working on
Jobflow, a Nuxt 4 + TypeScript job-search CRM built on top of Google Sheets.

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
- Google Sheets is the MVP data source; do not introduce a custom backend unless
  the Product Owner explicitly changes the constraint.
- Never store private keys, service account secrets, refresh tokens, or client
  secrets in frontend code.
- The UI must support English and Russian. Default locale must be detected from
  the browser, with English as the fallback locale.
- User-facing text must go through i18n messages. Domain data must store stable
  IDs and enum keys, never localized labels.
- Every non-trivial change needs tests and useful logging.
- Verification evidence beats confidence. "Looks right" is not a release gate.
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
- UI or UX work: Frontend UI Agent, Testing Agent, Security & Review Agent.
- Data models, stores, composables, derived metrics: Data & State Agent, Testing
  Agent, Security & Review Agent.
- Google Sheets, OAuth, row mapping, CRUD, quotas, retries: Google Sheets
  Platform Agent, Testing Agent, Security & Review Agent.
- Logging, audit events, client errors: Observability Agent, Testing Agent,
  Security & Review Agent.
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

## Project Rules

- Keep business logic out of presentational UI components.
- Keep Google Sheets details behind repository/service boundaries.
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

## Reference Model

This project borrows the lightweight operating model from
`addyosmani/agent-skills`: persona, workflow, and verification gate. It does not
copy the full repository or enable every skill by default.
