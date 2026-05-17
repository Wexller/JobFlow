<template>
  <div class="overflow-hidden rounded-lg border border-default">
    <table class="w-full min-w-[920px] text-left text-sm" :aria-label="$t('home.vacancies.tableLabel')">
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
            {{ $t('home.table.format') }}
          </th>
          <th class="px-4 py-3 font-medium">
            {{ $t('home.table.location') }}
          </th>
          <th class="px-4 py-3 font-medium">
            {{ $t('home.table.matchScore') }}
          </th>
          <th class="px-4 py-3 font-medium">
            {{ $t('home.table.salary') }}
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
            {{ $t(`domain.format.${vacancy.format}`) }}
          </td>
          <td class="px-4 py-3 text-muted">
            {{ vacancy.location ?? '—' }}
          </td>
          <td class="px-4 py-3">
            {{ formatOptionalNumber(vacancy.matchScore) }}
          </td>
          <td class="px-4 py-3">
            <div class="flex items-center justify-between gap-3">
              <span>{{ formatSalary(vacancy) }}</span>
              <UButton color="neutral" size="xs" variant="ghost" @click="$emit('select', vacancy.id)">
                {{ $t('home.details.open') }}
              </UButton>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Vacancy } from '../../schemas/vacancies.schema'

defineEmits<{
  select: [id: string]
}>()

defineProps<{
  vacancies: Vacancy[]
}>()

const { locale } = useI18n()
const moneyFormatter = computed(() =>
  new Intl.NumberFormat(locale.value, {
    maximumFractionDigits: 0,
  }),
)

function formatOptionalNumber(value: number | undefined): string {
  return value === undefined ? '—' : new Intl.NumberFormat(locale.value).format(value)
}

function formatSalary(vacancy: Vacancy): string {
  if (vacancy.salaryMin === undefined && vacancy.salaryMax === undefined) {
    return '—'
  }

  const range = [vacancy.salaryMin, vacancy.salaryMax]
    .filter((value): value is number => value !== undefined)
    .map((value) => moneyFormatter.value.format(value))
    .join('–')

  return vacancy.currency === undefined ? range : `${range} ${vacancy.currency}`
}
</script>
