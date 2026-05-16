# ADR 0001: Frontend-Only MVP With Google Sheets

## Status

Accepted for MVP.

## Context

The Product Owner wants a personal job-search CRM on top of an existing Google
Sheets tracker. The first release should avoid a custom backend if possible and
must not expose private keys or service account secrets in frontend code.

## Decision

Build the MVP as a Nuxt 4 frontend-only application. Use Google Identity
Services token model in the browser and call the Google Sheets REST API directly
with short-lived access tokens.

Do not use a service account or Node `googleapis` package in the browser.

## Consequences

Benefits:

- Faster MVP delivery.
- Static hosting remains possible.
- No custom backend or server secrets are required.
- The user's Google account remains the access boundary.

Tradeoffs:

- OAuth access tokens exist in browser memory.
- The `spreadsheets` scope is broad and sensitive.
- Product-level validation is enforced client-side.
- This is not the final architecture for a multi-user SaaS product.

## Guardrails

- Keep access tokens in memory only.
- Do not log OAuth data or spreadsheet values.
- Use typed repositories for all Sheets reads and writes.
- Use stable IDs for updates.
- Prefer archive/soft-delete behavior over physical row deletion in MVP.
- Add a backend/BFF or managed backend in a future product phase if multi-user
  access, audit history, or stronger authorization becomes necessary.
