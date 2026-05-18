# Agent Registry

This registry preserves the active Variant B team and the reserve Variant C
team. Active agents participate in normal MVP delivery. Reserve agents are
documented now and activated only by their triggers.

## Active Agents

| Agent | Status | Scope | Owned Areas | Inputs | Outputs | Definition of Done | Activation Triggers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Product / Domain Agent | active | Product behavior and job-search CRM domain | Entities, statuses, user flows, acceptance criteria | PO request, current product plan, sheet structure | Product spec, scenarios, edge cases, open questions | Acceptance criteria are clear, scoped, and testable | New product request, unclear domain logic, status/model changes |
| Solution Architect Agent | active | Application architecture and dependency choices | Nuxt structure, module boundaries, libraries, ADR candidates | Product spec, constraints, existing code | Architecture proposal, dependency plan, implementation slices | Architecture is simple, scalable, and decision-complete | New feature area, scaffold, dependency choice, major refactor |
| Backend / BFF Agent | active | Nuxt/Nitro server application layer | `server/api`, handlers, request validation, server-side orchestration, persistence boundary, error mapping | Product spec, data contract, runtime constraints | BFF design or implementation handoff | Browser-to-server boundaries are typed, testable, and maintainable | Server routes, BFF endpoints, privileged integrations, persistence orchestration |
| Data & State Agent | active | Typed domain models and shared data contracts | TypeScript types, validation schemas, Pinia, composables, shared DTOs, derived metrics | Domain spec, persistence schema, UI needs | Types, store/composable design, mapping contract | State and contracts are typed, testable, and isolated from UI details | Stores, metrics, filters, forms, typed API responses |
| Google Sheets Platform Agent | active | Google Sheets integration and data safety | Server-side Sheets access, ranges, row mapping, retries, sync semantics | Sheet schema, env config, data contract | Integration design or implementation handoff | Sync behavior is typed, quota-aware, and protected from schema drift | Sheets API, mapping, import, sync, data integrity |
| Frontend UI Agent | active | Nuxt/Vue user experience | Pages, components, layouts, Nuxt UI, project-aligned styling, VueUse | Product spec, architecture, data contract | UI implementation plan or handoff | UI has loading/empty/error states, responsive behavior, accessibility basics | Screens, forms, dashboard, kanban, timeline |
| Testing Agent | active | Test strategy and proof of correctness | Vitest, Vue Test Utils, Playwright, fixtures, mocks, route and service coverage | Diff, feature spec, risk notes | Test plan, tests, coverage gaps, verification report | Critical behavior is covered and commands are documented | Every feature, bug fix, integration, release gate |
| Observability Agent | active | Logging, auditability, and diagnostics | Structured logs, audit events, request IDs, client/server errors, redaction rules | Feature flows, error cases, privacy constraints | Logging plan or implementation handoff | Logs are useful and do not leak secrets or sensitive personal data | CRUD flows, auth, sync, production errors, release readiness |
| Security & Review Agent | active | Final quality and security review | Secrets, XSS, unsafe serialization, request validation, auth/session risk, architecture review | Diff, test output, implementation notes | Findings report, blockers, release recommendation | No blocking correctness, security, or maintainability issues remain | Before merge/release, auth/data changes, server routes, risky dependencies |

## Reserve Agents

| Agent | Status | Scope | Owned Areas | Inputs | Outputs | Definition of Done | Activation Triggers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Release / DevOps Agent | reserve | Delivery automation and release safety | CI, deploy previews, env checks, release checklist, rollback notes | Release candidate, test results, env needs | Release plan, CI changes, go/no-go checklist | Release path is repeatable and rollback is documented | CI, deploy preview, production deploy, release checklist |
| Documentation Agent | reserve | Durable project documentation | English README, setup guide, ADRs, onboarding, Google Cloud setup | Implemented behavior, architecture decisions, env config | Docs updates and maintenance checklist | A new contributor can set up and understand the feature | README, setup guide, ADR, onboarding, handoff docs, documentation drift |
| Performance Agent | reserve | Runtime and bundle performance | Bundle analysis, chart performance, Core Web Vitals, slow UI flows | UI implementation, build output, runtime metrics | Performance findings, fixes, budget recommendations | Regressions are measured and addressed or accepted | Dashboard/charts performance, bundle size, slow UI, Lighthouse |

## Activation Policy

- Start with one owner agent per task.
- Add reviewer agents based on risk, not habit.
- Activate reserve agents only when their trigger is present.
- For any BFF, server route, or persistence-boundary work, include Backend /
  BFF Agent, Testing Agent, and Security & Review Agent.
- For any Google Sheets, import/sync, or data integrity work, include Google
  Sheets Platform Agent, Backend / BFF Agent, Testing Agent, and Security &
  Review Agent.
- For every release candidate, include Testing Agent and Security & Review Agent.
- For production deploy or CI work, include Release / DevOps Agent.

## Registry Maintenance

- When a new recurring responsibility appears, update this registry before
  creating a new persona.
- Do not create meta-orchestrator agents. The Lead performs orchestration.
- Keep each persona single-purpose. If a role starts owning two unrelated
  responsibilities, split it.
