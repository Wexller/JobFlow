<template>
  <section class="space-y-4">
    <div>
      <h2 class="text-xl font-semibold tracking-normal">
        {{ $t('home.active.title') }}
      </h2>
      <p class="text-sm text-muted">
        {{ $t('home.active.description') }}
      </p>
    </div>

    <div class="overflow-hidden rounded-lg border border-default">
      <table class="w-full min-w-[720px] text-left text-sm" :aria-label="$t('home.active.tableLabel')">
        <thead class="bg-muted/40 text-xs uppercase text-muted">
          <tr>
            <th class="px-4 py-3 font-medium">
              {{ $t('home.table.company') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ $t('home.table.role') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ $t('home.table.status') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ $t('home.table.priority') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ $t('home.table.nextAction') }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-default">
          <tr v-for="vacancy in vacancies" :key="vacancy.id">
            <td class="px-4 py-3 font-medium">
              {{ vacancy.company }}
            </td>
            <td class="px-4 py-3 text-muted">
              {{ vacancy.role }}
            </td>
            <td class="px-4 py-3">
              <UBadge color="neutral" variant="soft">
                {{ $t(`domain.status.${vacancy.status}`) }}
              </UBadge>
            </td>
            <td class="px-4 py-3">
              {{ $t(`domain.priority.${vacancy.priority}`) }}
            </td>
            <td class="px-4 py-3 text-muted">
              {{ formatDate(vacancy.nextActionAt) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
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
  return value === undefined ? '—' : dateFormatter.value.format(parseISO(value))
}
</script>
