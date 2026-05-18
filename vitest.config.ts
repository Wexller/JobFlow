import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'happy-dom',
    environmentMatchGlobs: [
      ['tests/unit/postgres-*.test.ts', 'node'],
    ],
    globals: true,
  },
})
