# ADR 0001: Frontend-Only MVP With Google Sheets

## Status

Superseded by ADR 0004.

## Context

The Product Owner wants a personal job-search CRM on top of an existing Google
Sheets tracker. The first release should avoid a custom backend if possible and
must not expose private keys or service account secrets in frontend code.

## Decision

At the start of the project, the MVP was planned as a frontend-only application
that would call Google Sheets directly from the browser with short-lived access
tokens.

## Consequences

Benefits:

- Faster MVP delivery.
- Static hosting remains possible.
- No custom backend or server secrets are required.
- The user's Google account remains the access boundary.

Why it changed:

- The product now needs a single BFF entrypoint for reads and writes.
- Server-side validation and persistence orchestration reduce browser coupling.
- The project chose a DB-first direction with Google Sheets as an integration
  boundary rather than the primary runtime source.

## Replacement

Use ADR 0004 as the current source of truth for runtime architecture.
