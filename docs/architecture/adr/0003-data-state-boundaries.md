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
- repositories;
- Google Sheets REST client and row mappers.

UI components must not consume raw sheet rows or call Google Sheets directly.

## Consequences

Benefits:

- UI stays testable and independent from Sheets quirks.
- Sheet header changes are isolated to mappers and schemas.
- Dashboard metrics and filters can be unit-tested without Google access.
- A future backend or database can replace Sheets behind repositories.

Tradeoffs:

- More upfront structure than a direct table-rendering prototype.
- Mappers and fixtures must be maintained with the sheet schema.

## Guardrails

- Stable `id` is the entity key.
- Row number is technical metadata and should not be exposed to UI.
- Use Zod `safeParse` at form and Sheets boundaries.
- Normalize dates, empty values, numbers, booleans, and enum IDs before data
  reaches stores.
- Tests must cover mappers, schemas, filters, sorting, kanban grouping, and
  dashboard metrics.
