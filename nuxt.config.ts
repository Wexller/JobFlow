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
  fonts: {
    providers: {
      adobe: false,
      bunny: false,
      fontshare: false,
      fontsource: false,
      google: false,
      googleicons: false,
    },
  },
  runtimeConfig: {
    databaseUrl: process.env.JOBFLOW_DATABASE_URL ?? '',
    postgresAdapter: process.env.JOBFLOW_POSTGRES_ADAPTER ?? 'sql',
    googleSheetsServiceAccountEmail: process.env.JOBFLOW_GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL ?? '',
    googleSheetsSpreadsheetId: process.env.JOBFLOW_GOOGLE_SHEETS_SPREADSHEET_ID ?? '',
    googleSheetsPrivateKey: process.env.JOBFLOW_GOOGLE_SHEETS_PRIVATE_KEY ?? '',
    jobflowPersistenceDriver: process.env.JOBFLOW_PERSISTENCE_DRIVER ?? 'postgres',
    public: {
      appEnv: process.env.NUXT_PUBLIC_APP_ENV ?? 'local',
      defaultLocale: process.env.NUXT_PUBLIC_DEFAULT_LOCALE ?? 'en',
      fallbackLocale: process.env.NUXT_PUBLIC_FALLBACK_LOCALE ?? 'en',
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
