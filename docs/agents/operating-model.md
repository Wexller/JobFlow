# Agent Operating Model

This document defines how the Product Owner, Lead, and specialist agents work
together from request intake to release.

## Lifecycle

1. Intake
   - Product Owner describes the outcome, priority, constraints, and success
     criteria.
   - Lead identifies the owner agent, required reviewers, and whether reserve
     agents are needed.

2. Discovery
   - Owner agent studies only relevant context.
   - Discoverable facts are resolved from the repository before asking the
     Product Owner.
   - Product or tradeoff questions are escalated to the Product Owner.

3. Specification
   - Product / Domain Agent is used when behavior, user flows, or acceptance
     criteria are not yet clear.
   - Solution Architect Agent is used when module boundaries, dependencies, or
     long-term maintainability are affected.

4. Implementation
   - Work is split into small vertical slices.
   - Each slice has one owner and a clear write scope.
   - Shared contracts are updated before dependent UI work begins.

5. Verification
   - Testing Agent defines and verifies the test strategy.
   - Observability Agent verifies logging for important flows.
   - Security & Review Agent performs final code and security review.

6. Release
   - Release / DevOps Agent joins only for CI, deploy preview, production deploy,
     release checklist, or rollback planning.
   - The Lead merges reports and gives a go/no-go recommendation.

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

- Feature touching UI only:
  Frontend UI Agent -> Testing Agent -> Security & Review Agent

- Feature touching domain logic:
  Product / Domain Agent -> Data & State Agent -> Testing Agent -> Security &
  Review Agent

- Feature touching Google Sheets or OAuth:
  Google Sheets Platform Agent -> Testing Agent -> Observability Agent ->
  Security & Review Agent

- Feature touching architecture or dependencies:
  Solution Architect Agent -> Testing Agent -> Security & Review Agent

- Release or deployment:
  Testing Agent -> Security & Review Agent -> Release / DevOps Agent

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
