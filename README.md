# Jobflow

Jobflow is a planned Nuxt 4 and TypeScript web application for tracking a
personal job search process on top of Google Sheets.

The first MVP goal is to turn an existing Google Sheets tracker into a small
job-search CRM without introducing a custom backend. The app should help manage
vacancies, applications, pipeline stages, interviews, offers, and dashboard
metrics.

## Current Status

The repository contains the project agent operating model, architecture
decisions, the initial Nuxt application scaffold, typed domain enum IDs, Zod
runtime schemas, and unit coverage for the first data-boundary contracts.

## Product Direction

The MVP should provide:

- a dashboard with job-search metrics and next actions;
- vacancy management with table and kanban views;
- vacancy details with pipeline timeline, interviews, offer data, and notes;
- add/edit flows for vacancies, pipeline stages, interviews, and offers;
- Google Sheets as the first data source.

## Preferred Stack

- Nuxt 4
- Vue 3
- TypeScript
- Pinia
- Tailwind CSS
- Nuxt UI
- VueUse
- date-fns
- Zod
- ECharts / vue-echarts
- Vitest
- Vue Test Utils
- Playwright

The project should support English and Russian UI localization. Browser language
should be used as the default locale source, with a fallback locale defined by
the application.

## Runtime Requirements

- Node.js 22 or newer
- pnpm 9.14.4 or newer

Use the repository Node version with:

```bash
nvm use
```

## Architecture Decisions

The current architecture kickoff decisions are documented in:

- `docs/architecture/overview.md`
- `docs/roadmap.md`
- `docs/architecture/adr/0001-frontend-only-google-sheets.md`
- `docs/architecture/adr/0002-i18n-browser-locale.md`
- `docs/architecture/adr/0003-data-state-boundaries.md`

Key decisions:

- Build a Nuxt 4 frontend-only MVP first.
- Use Google Identity Services token model and Google Sheets REST API directly
  from the browser for the MVP.
- Keep Google Sheets details behind service/repository boundaries.
- Use `@nuxtjs/i18n` for English and Russian, with browser locale detection and
  English fallback.
- Store stable enum IDs in data; translate labels only in the UI.
- Use Zod for runtime validation at form, import, and Sheets boundaries.

## Commands

Use pnpm:

```bash
pnpm dev
pnpm build
pnpm preview
pnpm typecheck
pnpm lint
pnpm test
pnpm test:unit
pnpm test:nuxt
pnpm test:e2e
pnpm test:ci
```

`pnpm test:ci` is the full local quality gate. It runs linting, TypeScript
checking, unit tests, Nuxt component tests, Playwright e2e smoke tests, and the
production build.

Playwright e2e tests start the Nuxt dev server on `127.0.0.1:3000`. Install the
Chromium browser binary before running `pnpm test:e2e` or `pnpm test:ci` in a
fresh local environment:

```bash
pnpm exec playwright install chromium
```

In Linux CI environments, install browser system dependencies as well:

```bash
pnpm exec playwright install --with-deps chromium
```

## Planned Environment Variables

```env
NUXT_PUBLIC_GOOGLE_CLIENT_ID=
NUXT_PUBLIC_JOBFLOW_SPREADSHEET_ID=
NUXT_PUBLIC_GOOGLE_SHEETS_SCOPE=https://www.googleapis.com/auth/spreadsheets
NUXT_PUBLIC_GOOGLE_API_BASE=https://sheets.googleapis.com/v4
NUXT_PUBLIC_DEFAULT_LOCALE=en
NUXT_PUBLIC_FALLBACK_LOCALE=en
NUXT_PUBLIC_APP_ENV=local
NUXT_PUBLIC_SENTRY_DSN=
```

Private environment variables are not required for the frontend-only MVP. OAuth
client IDs and spreadsheet IDs are public browser configuration values, not
secrets.

## Agent Operating Model

This repository uses an agent operating model to keep product, architecture,
implementation, testing, observability, and review responsibilities clear.

- `AGENTS.md` is the main contract for agents and contributors.
- `docs/agents/registry.md` lists active and reserve agents.
- `docs/agents/operating-model.md` describes the delivery lifecycle and gates.
- `docs/agents/personas/` contains one persona file per agent.
- `docs/debugging.md` describes focused, token-efficient debugging handoffs.

The active MVP team is Variant B. Variant C is preserved as reserve agents and
activated only when its triggers are present.
Small task mode keeps low-risk work scoped to one owner, narrow context, and
targeted verification.

## Documentation Rule

`README.md` must remain written in English and must be updated whenever setup,
commands, dependencies, architecture, environment variables, testing, CI,
deployment, or release workflow changes.

## Repository Status

The Nuxt 4 scaffold is in place. Install dependencies with `pnpm install`, then
run `pnpm dev` to start local development.
