<template>
  <UApp>
    <div class="min-h-screen bg-default text-default">
      <header class="border-b border-default bg-default">
        <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <NuxtLinkLocale class="text-lg font-semibold" to="/">
            {{ $t('app.name') }}
          </NuxtLinkLocale>
          <div class="flex items-center gap-4">
            <nav class="flex items-center gap-2" :aria-label="$t('layout.primaryNav')">
              <NuxtLinkLocale class="text-sm text-muted transition hover:text-default" to="/">
                {{ $t('layout.homeLink') }}
              </NuxtLinkLocale>
              <NuxtLinkLocale class="text-sm text-muted transition hover:text-default" to="/vacancies">
                {{ $t('layout.vacanciesLink') }}
              </NuxtLinkLocale>
            </nav>
            <nav class="flex items-center gap-2" :aria-label="$t('layout.languageNav')">
            <UButton
              v-for="localeItem in availableLocales"
              :key="localeItem.code"
              :aria-pressed="locale === localeItem.code"
              :color="locale === localeItem.code ? 'primary' : 'neutral'"
              size="sm"
              variant="ghost"
              @click="setLocale(localeItem.code)"
            >
              {{ localeItem.code.toUpperCase() }}
            </UButton>
            </nav>
          </div>
        </div>
      </header>

      <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <slot />
      </main>
    </div>
  </UApp>
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

const availableLocales = computed(() =>
  locales.value.map((item) => (typeof item === 'string' ? { code: item } : item)),
)
</script>
