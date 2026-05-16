# ADR 0002: English/Russian i18n With Browser Locale Detection

## Status

Accepted for MVP.

## Context

The application must support English and Russian. The initial locale should come
from the browser when possible.

## Decision

Use `@nuxtjs/i18n` with English and Russian locale files.

Configuration intent:

```ts
i18n: {
  defaultLocale: 'en',
  strategy: 'prefix_except_default',
  locales: [
    { code: 'en', language: 'en-US', file: 'en.json', name: 'English' },
    { code: 'ru', language: 'ru-RU', file: 'ru.json', name: 'Русский' },
  ],
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: 'jobflow_locale',
    fallbackLocale: 'en',
    redirectOn: 'root',
  },
}
```

English is the fallback locale.

## Consequences

- First visit uses browser language or `Accept-Language` detection.
- Manual language switching persists in `jobflow_locale`.
- User-facing strings must use i18n messages.
- Domain data, Google Sheets values, filters, sorting, and metrics must use
  stable IDs instead of translated labels.

## Guardrails

- Do not store localized status labels in Google Sheets.
- Do not sort, filter, or group by translated text.
- Add fallback messages for unknown enum values.
- Add tests for browser locale behavior and locale switching.
