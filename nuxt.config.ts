export default defineNuxtConfig({
  compatibilityDate: '2026-05-16',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      appEnv: process.env.NUXT_PUBLIC_APP_ENV ?? 'local',
      defaultLocale: process.env.NUXT_PUBLIC_DEFAULT_LOCALE ?? 'en',
      fallbackLocale: process.env.NUXT_PUBLIC_FALLBACK_LOCALE ?? 'en',
      googleApiBase: process.env.NUXT_PUBLIC_GOOGLE_API_BASE ?? 'https://sheets.googleapis.com/v4',
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
      googleSheetsScope: process.env.NUXT_PUBLIC_GOOGLE_SHEETS_SCOPE ?? 'https://www.googleapis.com/auth/spreadsheets',
      jobflowSpreadsheetId: process.env.NUXT_PUBLIC_JOBFLOW_SPREADSHEET_ID ?? '',
      sentryDsn: process.env.NUXT_PUBLIC_SENTRY_DSN ?? '',
    },
  },
  i18n: {
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    langDir: 'locales',
    locales: [
      {
        code: 'en',
        file: 'en.json',
        language: 'en-US',
        name: 'English',
      },
      {
        code: 'ru',
        file: 'ru.json',
        language: 'ru-RU',
        name: 'Русский',
      },
    ],
    detectBrowserLanguage: {
      cookieKey: 'jobflow_locale',
      fallbackLocale: 'en',
      redirectOn: 'root',
      useCookie: true,
    },
  },
  typescript: {
    strict: true,
    typeCheck: true,
  },
})
