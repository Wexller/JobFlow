# Architecture Overview

## Summary

Jobflow starts as a Nuxt 4 + TypeScript frontend-only MVP for one user. Google
Sheets remains the data source, accessed from the browser through Google
Identity Services and the Google Sheets REST API. The application must support
English and Russian from the first scaffold, with browser locale detection and
English fallback.

## Recommended Stack

Runtime:

- Node.js 22 or newer
- pnpm 9.14.4 or newer

Runtime dependencies:

- Nuxt 4
- Vue 3
- TypeScript
- `@nuxtjs/i18n`
- `@pinia/nuxt` and Pinia
- `@vueuse/nuxt` and VueUse
- Nuxt UI v4
- Tailwind CSS
- date-fns
- Zod
- ECharts and vue-echarts

Nuxt Fonts remote providers are disabled in project configuration. The MVP uses
system font fallbacks until a deliberate local/self-hosted font decision is made.

Development and testing dependencies:

- vue-tsc
- `@nuxt/eslint` and ESLint
- `@nuxt/test-utils`
- Vitest
- Vue Test Utils
- happy-dom
- Playwright
- `@pinia/testing`
- MSW

## Application Boundaries

```text
Pages
  -> UI components
  -> Pinia stores and composables
  -> Domain services and repositories
  -> Google Sheets REST client
  -> Google Sheets
```

Rules:

- UI components receive domain objects, not raw spreadsheet rows.
- Pinia stores do not call Google APIs directly.
- Repositories hide row ranges, headers, row numbers, and Google API response
  shapes.
- Domain data stores stable enum IDs. Translated labels are presentation-only.
- Forms and imported sheet rows are validated with Zod.

## Planned Project Structure

```text
app/
  assets/css/main.css
  components/
    dashboard/
    vacancies/
    pipeline/
    interviews/
    offers/
    shared/
  composables/
    useDashboardMetrics.ts
    useKanbanGroups.ts
    useVacancyFilters.ts
    useVacancyForm.ts
    useVacancySorting.ts
  domain/
    interviews.ts
    offers.ts
    pipeline.ts
    vacancies.ts
  pages/
    index.vue
    vacancies/index.vue
    vacancies/[id].vue
    vacancies/new.vue
    vacancies/[id]/edit.vue
    interviews/index.vue
    offers/index.vue
    settings.vue
  repositories/
    googleSheetsRepository.ts
    mockRepository.ts
  schemas/
    common.schema.ts
    interviews.schema.ts
    offers.schema.ts
    pipeline.schema.ts
    summary-metrics.schema.ts
    vacancies.schema.ts
  services/google/
    googleIdentity.client.ts
    sheetsClient.ts
    sheetsRanges.ts
    sheetsRowMappers.ts
  stores/
    auth.ts
    filters.ts
    sync.ts
    vacancies.ts
  utils/
    dates.ts
    logger.ts
    redaction.ts
    result.ts
tests/
  fixtures/
  unit/
  nuxt/
  e2e/
i18n/
  locales/
    en.json
    ru.json
```

Nuxt may generate or prefer small variations in folder names. Keep the same
boundaries even if the final scaffold differs slightly.

## i18n Approach

Use `@nuxtjs/i18n` with:

- locales: `en`, `ru`;
- `defaultLocale: 'en'`;
- `strategy: 'prefix_except_default'`;
- lazy locale files in `i18n/locales`;
- browser locale detection enabled;
- locale cookie key: `jobflow_locale`;
- fallback locale: `en`.

The first visit should use browser language or `Accept-Language` detection.
Manual locale switching should persist the chosen locale in the locale cookie.

## Data And State Strategy

- Zod schemas are the runtime source of truth for validation.
- TypeScript types are inferred from schemas when practical.
- Domain models are separate from Google Sheets row DTOs.
- Dashboard metrics are derived from normalized domain objects.
- Filters, sorting, kanban grouping, and dashboard metrics operate on enum IDs,
  not translated labels.
- Unknown enum values map to a safe `unknown` state and are surfaced as data
  quality warnings.

## Logging Strategy

Start with a typed logger wrapper:

- `info`
- `warn`
- `error`
- `audit`

Allowed fields:

- action type;
- entity type;
- entity ID;
- status;
- duration;
- HTTP status;
- retry count;
- sanitized error kind.

Never log:

- OAuth tokens;
- refresh tokens;
- service account secrets;
- spreadsheet values;
- private notes;
- personal contacts;
- company names;
- salary values;
- raw row data.

Sentry can be added later with explicit redaction and only a public DSN.

## Testing Strategy

- Unit tests: schemas, mappers, date normalization, enum normalization, filters,
  sorting, kanban grouping, dashboard metrics, logger redaction.
- Nuxt/component tests: forms, loading/empty/error/success states, locale
  switcher, store/composable integration.
- Integration tests: repository contracts with mocked Google Sheets responses.
- E2E smoke: browser locale detection, vacancy list, filter, kanban, create/edit
  flow, auth denied, Sheets API error state.

CI must not use live Google credentials. Use MSW and fixtures for automated
tests. Live Google Sheets checks stay manual until release automation exists.

## Sources

- Nuxt i18n module: https://nuxt.com/modules/i18n
- Nuxt i18n browser locale: https://i18n.nuxtjs.org/docs/composables/use-browser-locale
- Pinia with Nuxt: https://pinia.vuejs.org/ssr/nuxt.html
- VueUse with Nuxt: https://vueuse.org/guide/
- Nuxt testing: https://nuxt.com/docs/4.x/getting-started/testing
- Nuxt UI module: https://nuxt.com/modules/ui/
- Nuxt Fonts configuration: https://fonts.nuxt.com/get-started/configuration/
- Zod: https://zod.dev/
- Playwright: https://playwright.dev/docs/intro
