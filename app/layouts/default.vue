<template>
  <UApp>
    <div class="min-h-screen bg-default text-default">
      <header class="border-b border-default bg-default">
        <div class="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between gap-3">
            <NuxtLinkLocale class="text-lg font-semibold" to="/">
              {{ $t('app.name') }}
            </NuxtLinkLocale>
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
          <nav class="overflow-x-auto pb-1" :aria-label="$t('layout.primaryNav')">
            <div class="flex min-w-max items-center gap-2">
              <NuxtLinkLocale class="rounded-md px-2 py-1 text-sm text-muted transition hover:bg-muted/30 hover:text-default" to="/">
                {{ $t('layout.homeLink') }}
              </NuxtLinkLocale>
              <NuxtLinkLocale class="rounded-md px-2 py-1 text-sm text-muted transition hover:bg-muted/30 hover:text-default" to="/vacancies">
                {{ $t('layout.vacanciesLink') }}
              </NuxtLinkLocale>
              <NuxtLinkLocale class="rounded-md px-2 py-1 text-sm text-muted transition hover:bg-muted/30 hover:text-default" to="/pipeline-events">
                {{ $t('layout.pipelineEventsLink') }}
              </NuxtLinkLocale>
              <NuxtLinkLocale class="rounded-md px-2 py-1 text-sm text-muted transition hover:bg-muted/30 hover:text-default" to="/interviews">
                {{ $t('layout.interviewsLink') }}
              </NuxtLinkLocale>
              <NuxtLinkLocale class="rounded-md px-2 py-1 text-sm text-muted transition hover:bg-muted/30 hover:text-default" to="/offers">
                {{ $t('layout.offersLink') }}
              </NuxtLinkLocale>
            </div>
          </nav>
        </div>
      </header>

      <main class="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
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
