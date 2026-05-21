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
- Work item delivery is ID-driven: one work item ID, one dedicated branch, one
  PR, one merge to `main`.
- A work item is marked `done` only after confirmed production release.
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
- Active work item planning and delivery now live in GitHub Issues.
- `docs/feature-bank.md`, `docs/refactor-bank.md`, `docs/fix-bank.md`,
  `docs/workitems/`, and `docs/roadmap.active.md` are legacy read-only history
  unless the Product Owner explicitly requests archival updates.
- `docs/roadmap.md` remains legacy context and must not be used for active
  planning unless the Product Owner explicitly requests it.

## Work Item Intake And Lifecycle

- Product Owner submits work item requests using a natural-language intake
  request.
- If the Product Owner shares free-form thoughts, ideas, or problem statements
  without naming the type, Codex classifies the intake as `FEAT`, `REF`, or
  `FIX` using the work item classification rules and records it in the
  corresponding bank.
- New accepted work items are created as GitHub issues.
- Legacy `FEAT-XXX`, `REF-XXX`, and `FIX-XXX` IDs remain historical references
  only and are no longer the active source of truth for new work.
- Work item lifecycle statuses are:
  `new -> triage -> discovery -> planned -> in_progress -> in_review -> released -> done`
  with optional terminal status `cancelled`.
- Intake creates or updates a GitHub issue using the GitHub naming policy and
  label rules.
- Study or planning starts with a direct command that targets the GitHub issue
  number (for example, `plan #123` or `изучи #123`).
- For study or planning requests, the Lead reads the issue, activates the
  required agents, and updates the issue body as the working technical spec.
- Implementation starts with a direct command that targets the GitHub issue
  number (for example, `implement #123` or `реализуй #123`).
- Implementation uses the GitHub issue body as the working technical
  specification.
- Unless the Product Owner explicitly asks to stop earlier, an implementation
  command means the full delivery flow: create a development-linked branch from
  `main`, implement, run required checks, create commit, open PR, merge to
  `main`, and switch back to `main`.
- If the issue body does not contain the required planning sections, Codex must
  stop and wait for explicit Product Owner approval before implementing without
  a complete spec.
- Text-only study, planning, or implementation requests without ID are allowed
  only after explicit confirmation of the matched GitHub issue number.

User command examples:

- `plan #23`
- `изучи #23`
- `implement #23`
- `реализуй #23 полностью`
- `implement #23 but stop before PR`
- `реализуй #23, но остановись перед коммитом`
- `gh issue develop 23 --name fix/23-mobile-page-block-spacing --base main --checkout`
- `gh pr create --fill`

## Work Item Classification

- `FEAT`: new capability, new user-facing outcome, or noticeable product
  expansion.
- `REF`: structural improvement, module reorganization, or maintainability /
  internal performance improvement without changing intended behavior.
- `FIX`: defect correction, regression repair, recovery of expected behavior,
  or production issue resolution.
- When intake does not explicitly name the type, Codex chooses the best match
  from these rules before assigning the ID and bank.

## Branch And Release Policy

- One work item equals one branch.
- Active GitHub issue-backed flow must use the GitHub naming policy branch format:
  `type/<issue-number>-short-description`.
- Work item branches are created from `main` through
  `gh issue develop <issue-number> --name type/<issue-number>-short-description --base main --checkout`
  so the branch appears in the issue's `Development` section.
- One work item branch must not include scope for multiple work items.
- Default implementation sequence is:
  create development-linked branch -> implement -> verify -> commit -> PR ->
  squash merge to `main` -> switch back to `main`.
- Merge strategy to `main` is squash merge.
- Codex should not stop at "PR handoff" unless the Product Owner explicitly asks
  to pause before merge.
- After merge to `main`, Codex switches back to `main`.
- A merged work item is not automatically `done`.
- After merge, move the GitHub issue to `status:released`.
- Work item status changes to `done` only after confirmed production/market
  deployment. Until then, it remains `in_review` or `released`.
- After confirmed production release, move the GitHub issue to `status:done`
  and close it.
- Production release branches are created from `main` with
  `pnpm release:branch -- --version <SemVer>`.
- Production release branch format is exactly `release/<SemVer>`.
- Release branches are persistent and serve as the Docker build branch and
  release record.
- Production release flow does not require Git tags.

## GitHub Naming Policy

- Use the GitHub issue number as the canonical implementation reference for
  branch names, commits, and PR titles.
- The issue type must stay consistent across issue title, branch name, commit
  messages, and PR title.
- Do not use an `ISSUE-*` prefix in branch names, commits, or PR titles.

Issue title format:

- `[type][scope1,scope2] Human-readable title`
- Allowed types: `feat`, `fix`, `ref`
- Use one to three scopes in lowercase kebab-case.
- The human-readable title should describe the problem or outcome, not an
  implementation step.

Branch name format:

- `type/<issue-number>-short-description`
- Examples:
  - `fix/123-home-mobile-table`
  - `feat/145-vacancy-search`
  - `ref/203-store-composition-api`

Commit message format:

- `type(scope1,scope2): message (#issue-number)`
- Use conventional commit style.
- Start the message with an imperative verb.
- Examples:
  - `fix(home,mobile): make main page table usable on mobile (#123)`
  - `feat(vacancies,forms): replace vacancy select with searchable input (#145)`
  - `ref(store,pinia): move jobflow store to composition api (#203)`

PR title format:

- PR title should usually match the final squash commit title.
- Use the same format as commits:
  `type(scope1,scope2): message (#issue-number)`.
- Link the PR to the issue using a development-linked branch and an `Issue: #123`
  line in the PR body.
- Do not use `Closes #123`, `Fixes #123`, or `Resolves #123` because those
  auto-close the issue before confirmed release.

Preferred scope vocabulary includes:

- `home`, `mobile`, `desktop`, `layout`, `vacancies`, `pipeline`,
  `interviews`, `offers`, `forms`, `table`, `dashboard`, `store`, `pinia`,
  `api`, `server`, `db`, `migrations`, `auth`, `i18n`, `tests`, `docs`

Guardrails:

- One branch maps to one primary issue.
- One PR maps to one primary issue.
- Use product or system areas as scopes, not filenames.
- Avoid generic scopes like `misc`.
- Keep branch descriptions short and readable.
- Required labels:
  - one `type:*`
  - one `status:*`
  - one `priority:*`
- Required issue body sections:
  - `Summary`
  - `Goals`
  - `Scope`
  - `Non-Goals`
  - `Affected Areas`
  - `Acceptance Criteria`
  - `Risks`
  - `Verification`

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

- New feature: Product / Domain Agent, then Solution Architect Agent when
  needed, then implementation owner, then Testing Agent and Security & Review
  Agent.
- New refactor: Solution Architect Agent first, then implementation owner, then
  Testing Agent and Security & Review Agent.
- New fix: nearest owner agent for the failing area, then Testing Agent and
  Security & Review Agent.
- Study or planning of a work item: required owner agents first, with the
  outcome recorded in the GitHub issue body.
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

A work item is done only when:

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
- The Lead confirms the PR is linked to one primary GitHub issue and that the
  issue body is complete enough for implementation.
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
- Keep active task tracking in GitHub Issues, not in repository-local work item
  docs.
- Treat `docs/feature-bank.md`, `docs/refactor-bank.md`, `docs/fix-bank.md`,
  `docs/workitems/`, and `docs/roadmap.active.md` as legacy read-only history
  unless the Product Owner explicitly requests archival maintenance.
- Treat `docs/roadmap.md` as legacy history. Do not modify it for normal
  delivery tracking unless explicitly requested by the Product Owner.

## Reference Model

This project borrows the lightweight operating model from
`addyosmani/agent-skills`: persona, workflow, and verification gate. It does not
copy the full repository or enable every skill by default.
