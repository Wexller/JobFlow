<template>
  <UApp>
    <div class="min-h-screen overflow-x-clip bg-default text-default">
      <header class="border-b border-default bg-default">
        <div class="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between gap-3">
            <NuxtLinkLocale class="text-lg font-semibold" to="/">
              {{ $t('app.name') }}
            </NuxtLinkLocale>
            <div class="flex items-center gap-2">
              <nav class="hidden items-center gap-2 md:flex" :aria-label="$t('layout.languageNav')">
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
              <UButton
                class="md:hidden"
                color="neutral"
                size="sm"
                variant="ghost"
                :aria-expanded="isMobileMenuOpen"
                aria-controls="mobile-primary-nav"
                :label="$t('layout.primaryNav')"
                icon="i-lucide-menu"
                @click="isMobileMenuOpen = !isMobileMenuOpen"
              />
            </div>
          </div>
          <nav class="hidden md:block" :aria-label="$t('layout.primaryNav')">
            <div class="flex items-center gap-2">
              <NuxtLinkLocale class="rounded-md px-2 py-1 text-sm text-muted transition hover:bg-muted/30 hover:text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60" to="/">
                {{ $t('layout.homeLink') }}
              </NuxtLinkLocale>
              <NuxtLinkLocale class="rounded-md px-2 py-1 text-sm text-muted transition hover:bg-muted/30 hover:text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60" to="/vacancies">
                {{ $t('layout.vacanciesLink') }}
              </NuxtLinkLocale>
              <NuxtLinkLocale class="rounded-md px-2 py-1 text-sm text-muted transition hover:bg-muted/30 hover:text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60" to="/pipeline-events">
                {{ $t('layout.pipelineEventsLink') }}
              </NuxtLinkLocale>
              <NuxtLinkLocale class="rounded-md px-2 py-1 text-sm text-muted transition hover:bg-muted/30 hover:text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60" to="/interviews">
                {{ $t('layout.interviewsLink') }}
              </NuxtLinkLocale>
              <NuxtLinkLocale class="rounded-md px-2 py-1 text-sm text-muted transition hover:bg-muted/30 hover:text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60" to="/offers">
                {{ $t('layout.offersLink') }}
              </NuxtLinkLocale>
            </div>
          </nav>
          <div
            v-if="isMobileMenuOpen"
            id="mobile-primary-nav"
            class="space-y-2 rounded-lg border border-default bg-default p-3 md:hidden"
            :aria-label="$t('layout.primaryNav')"
          >
            <nav class="flex flex-col gap-1">
              <NuxtLinkLocale
                v-for="item in navItems"
                :key="item.to"
                :to="item.to"
                class="rounded-md px-2 py-2 text-sm text-muted transition hover:bg-muted/30 hover:text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                @click="isMobileMenuOpen = false"
              >
                {{ $t(item.labelKey) }}
              </NuxtLinkLocale>
            </nav>
            <nav class="flex items-center gap-2 border-t border-default pt-2" :aria-label="$t('layout.languageNav')">
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

      <main class="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <slot />
      </main>
    </div>
  </UApp>
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()
const route = useRoute()
const isMobileMenuOpen = ref(false)

const availableLocales = computed(() =>
  locales.value.map((item) => (typeof item === 'string' ? { code: item } : item)),
)

const navItems = [
  { labelKey: 'layout.homeLink', to: '/' },
  { labelKey: 'layout.vacanciesLink', to: '/vacancies' },
  { labelKey: 'layout.pipelineEventsLink', to: '/pipeline-events' },
  { labelKey: 'layout.interviewsLink', to: '/interviews' },
  { labelKey: 'layout.offersLink', to: '/offers' },
] as const

watch(() => route.fullPath, () => {
  isMobileMenuOpen.value = false
})
</script>
