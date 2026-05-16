<template>
  <section class="space-y-6">
    <div class="space-y-3">
      <UBadge color="primary" variant="soft">
        {{ $t('home.badge') }}
      </UBadge>
      <h1 class="max-w-3xl text-3xl font-bold tracking-normal sm:text-4xl">
        {{ $t('home.title') }}
      </h1>
      <p class="max-w-2xl text-base text-muted">
        {{ $t('home.description') }}
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <UCard v-for="card in cards" :key="card.key">
        <template #header>
          <h2 class="text-base font-semibold">
            {{ $t(card.titleKey) }}
          </h2>
        </template>
        <p class="text-sm text-muted">
          {{ $t(card.descriptionKey) }}
        </p>
      </UCard>
    </div>
  </section>
</template>

<script setup lang="ts">
const cards = [
  {
    key: 'dashboard',
    titleKey: 'home.cards.dashboard.title',
    descriptionKey: 'home.cards.dashboard.description',
  },
  {
    key: 'vacancies',
    titleKey: 'home.cards.vacancies.title',
    descriptionKey: 'home.cards.vacancies.description',
  },
  {
    key: 'sheets',
    titleKey: 'home.cards.sheets.title',
    descriptionKey: 'home.cards.sheets.description',
  },
]
</script>
