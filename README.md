# Jobflow

Jobflow is a planned Nuxt 3 and TypeScript web application for tracking a
personal job search process on top of Google Sheets.

The first MVP goal is to turn an existing Google Sheets tracker into a small
job-search CRM without introducing a custom backend. The app should help manage
vacancies, applications, pipeline stages, interviews, offers, and dashboard
metrics.

## Current Status

The repository currently contains the project agent operating model. Application
scaffolding has not been generated yet.

## Product Direction

The MVP should provide:

- a dashboard with job-search metrics and next actions;
- vacancy management with table and kanban views;
- vacancy details with pipeline timeline, interviews, offer data, and notes;
- add/edit flows for vacancies, pipeline stages, interviews, and offers;
- Google Sheets as the first data source.

## Preferred Stack

- Nuxt 3
- Vue 3
- TypeScript
- Pinia
- Tailwind CSS
- Nuxt UI or shadcn-vue
- VueUse
- date-fns
- ECharts, ApexCharts, or Chart.js
- Vitest
- Vue Test Utils
- Playwright

The project should support English and Russian UI localization. Browser language
should be used as the default locale source, with a fallback locale defined by
the application.

## Agent Operating Model

This repository uses an agent operating model to keep product, architecture,
implementation, testing, observability, and review responsibilities clear.

- `AGENTS.md` is the main contract for agents and contributors.
- `docs/agents/registry.md` lists active and reserve agents.
- `docs/agents/operating-model.md` describes the delivery lifecycle and gates.
- `docs/agents/personas/` contains one persona file per agent.

The active MVP team is Variant B. Variant C is preserved as reserve agents and
activated only when its triggers are present.

## Documentation Rule

`README.md` must remain written in English and must be updated whenever setup,
commands, dependencies, architecture, environment variables, testing, CI,
deployment, or release workflow changes.

## Repository Status

No application commands are available yet. They will be added after the Nuxt
project is scaffolded.
