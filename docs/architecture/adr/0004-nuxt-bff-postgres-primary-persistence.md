# ADR 0004: Nuxt BFF With DB-First Persistence

## Status

Accepted.

## Context

The project needs a single application entrypoint for reads and writes, safer
server-side validation, and a path to stronger persistence than browser-direct
Google Sheets access.

## Decision

Use the Nuxt/Nitro server as a BFF. The browser must access application data
through `server/api` routes. The target primary persistence is managed Postgres.
Google Sheets remains a server-side integration boundary for import, sync, and
export flows.

The repository now includes the BFF structure and contracts. The current
workspace still uses an in-memory development adapter by default until the
Postgres adapter is wired.

## Consequences

Benefits:

- One entrypoint for browser reads and writes.
- Validation and error mapping move to the server boundary.
- Persistence can evolve independently from the UI.
- Google Sheets credentials no longer need to exist in frontend code.

Tradeoffs:

- The runtime now includes a stateful server layer.
- Deployment and environment management become more important.
- Postgres adapter work remains to be completed after the BFF foundation.

## Guardrails

- Treat the BFF as the only application data entrypoint for the browser.
- Keep public runtime config free of secrets.
- Use typed repository contracts between routes, services, and persistence.
- Keep Google Sheets behind server-side gateways.
- Avoid dual-write until sync semantics are explicitly designed and tested.
