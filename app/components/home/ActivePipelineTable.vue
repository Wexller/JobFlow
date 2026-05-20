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

    <div class="rounded-lg border border-default">
      <ul class="divide-y divide-default md:hidden">
        <li v-for="vacancy in vacancies" :key="vacancy.id" class="space-y-2 px-4 py-3">
          <div class="space-y-1">
            <p class="font-medium">
              {{ vacancy.company }}
            </p>
            <p class="text-sm text-muted">
              {{ vacancy.role }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <UBadge color="neutral" variant="soft">
              {{ $t(`domain.status.${vacancy.status}`) }}
            </UBadge>
            <span class="text-sm">
              {{ $t(`domain.priority.${vacancy.priority}`) }}
            </span>
          </div>

          <p class="text-sm text-muted">
            {{ $t('home.table.nextAction') }}: {{ formatDate(vacancy.nextActionAt) }}
          </p>
        </li>
      </ul>

      <div class="hidden overflow-x-auto md:block">
        <table class="w-full min-w-[640px] text-left text-sm" :aria-label="$t('home.active.tableLabel')">
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
  if (value === undefined) {
    return '—'
  }

  const parsed = parseISO(value)
  return Number.isNaN(parsed.getTime()) ? '—' : dateFormatter.value.format(parsed)
}
</script>
