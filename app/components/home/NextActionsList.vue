<template>
  <aside class="space-y-4">
    <div>
      <h2 class="text-xl font-semibold tracking-normal">
        {{ $t('home.nextActions.title') }}
      </h2>
      <p class="text-sm text-muted">
        {{ $t('home.nextActions.description') }}
      </p>
    </div>

    <UCard v-for="vacancy in vacancies" :key="vacancy.id">
      <div class="space-y-3">
        <div>
          <p class="font-medium">
            {{ vacancy.company }}
          </p>
          <p class="text-sm text-muted">
            {{ vacancy.role }}
          </p>
        </div>
        <div class="flex items-center justify-between gap-3 text-sm">
          <UBadge color="primary" variant="soft">
            {{ $t(`domain.status.${vacancy.status}`) }}
          </UBadge>
          <span class="text-muted">{{ formatDate(vacancy.nextActionAt) }}</span>
        </div>
      </div>
    </UCard>

    <p v-if="vacancies.length === 0" class="rounded-lg border border-default px-4 py-6 text-sm text-muted">
      {{ $t('home.nextActions.empty') }}
    </p>
  </aside>
</template>

<script setup lang="ts">
import { parseISO } from 'date-fns'
import type { Vacancy } from '../../schemas/vacancies.schema'

defineProps<{
  vacancies: Vacancy[]
}>()

const { locale } = useI18n()
const dateFormatter = computed(() =>
  new Intl.DateTimeFormat(locale.value, {
    day: 'numeric',
    month: 'short',
  }),
)

function formatDate(value: string | undefined): string {
  if (value === undefined) {
    return '—'
  }

  const parsed = parseISO(value)
  return Number.isNaN(parsed.getTime()) ? '—' : dateFormatter.value.format(parsed)
}
</script>
