# ADR 0003: Data, State, And Sheets Boundaries

## Status

Accepted for MVP.

## Context

Google Sheets rows are flexible and human-editable, while the UI needs stable
typed objects. Without clear boundaries, spreadsheet details can leak into
components and make the app fragile.

## Decision

Separate the application into these layers:

- domain models and enum IDs;
- Zod schemas and normalizers;
- Pinia stores and composables;
- transport contracts for the BFF boundary;
- server-side application services;
- repositories and persistence gateways;
- Google Sheets integration gateways and row mappers.

UI components must not consume raw sheet rows, transport payloads, or call
Google Sheets directly. The browser should talk only to typed BFF endpoints.

## Consequences

Benefits:

- UI stays testable and independent from Sheets quirks.
- Server-side orchestration can validate writes before persistence.
- Sheet header changes stay isolated to integration mappers and schemas.
- Dashboard metrics and filters can be unit-tested without Google access.
- A future backend or database can replace Sheets behind repositories.

Tradeoffs:

- More upfront structure than a direct table-rendering prototype.
- Transport contracts and server services add another validation boundary.
- Mappers and fixtures must be maintained with both API and integration schemas.

## Guardrails

- Stable `id` is the entity key.
- Row number is technical metadata and should not be exposed to UI.
- Use Zod `safeParse` at form, API, and Sheets boundaries.
- Normalize dates, empty values, numbers, booleans, and enum IDs before data
  reaches stores or persistence.
- Keep write orchestration out of presentational components and Pinia selectors.
- Tests must cover mappers, schemas, stores, services, filters, sorting, kanban
  grouping, and dashboard metrics.
