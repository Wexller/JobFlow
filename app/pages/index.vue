<template>
  <section class="space-y-8">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
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

      <div class="text-sm text-muted">
        {{ $t('home.sync.loaded') }}
      </div>
    </div>

    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <UCard v-for="metric in visibleMetrics" :key="metric.id">
        <div class="space-y-2">
          <p class="text-sm font-medium text-muted">
            {{ $t(`home.metrics.${metric.id}`) }}
          </p>
          <p class="text-3xl font-semibold tracking-normal">
            {{ formatMetric(metric) }}
          </p>
        </div>
      </UCard>
    </div>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
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
          <table class="w-full min-w-[720px] text-left text-sm">
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
              <tr v-for="vacancy in activeVacancies" :key="vacancy.id">
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

      <aside class="space-y-4">
        <div>
          <h2 class="text-xl font-semibold tracking-normal">
            {{ $t('home.nextActions.title') }}
          </h2>
          <p class="text-sm text-muted">
            {{ $t('home.nextActions.description') }}
          </p>
        </div>

        <UCard v-for="vacancy in nextActions" :key="vacancy.id">
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

        <p v-if="nextActions.length === 0" class="rounded-lg border border-default px-4 py-6 text-sm text-muted">
          {{ $t('home.nextActions.empty') }}
        </p>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { compareAsc, parseISO } from 'date-fns'
import { useJobflowStore } from '~/stores/jobflow'
import type { SummaryMetric } from '../schemas/summary-metrics.schema'

const store = useJobflowStore()
const { locale } = useI18n()

if (store.sync.status === 'idle') {
  await store.load()
}

const visibleMetricIds = [
  'total_applications',
  'active_processes',
  'interviews_this_week',
  'offers',
  'reply_rate',
  'interview_rate',
  'offer_rate',
  'next_actions',
] as const

const activeVacancies = computed(() => store.activeVacancies)
const visibleMetrics = computed(() =>
  visibleMetricIds
    .map((id) => store.dashboardMetrics.find((metric) => metric.id === id))
    .filter((metric): metric is SummaryMetric => metric !== undefined),
)
const nextActions = computed(() =>
  store.activeVacancies
    .filter((vacancy) => vacancy.nextActionAt !== undefined)
    .toSorted((first, second) => compareAsc(parseISO(first.nextActionAt ?? ''), parseISO(second.nextActionAt ?? '')))
    .slice(0, 4),
)

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

  return dateFormatter.value.format(parseISO(value))
}

function formatMetric(metric: SummaryMetric): string {
  if (metric.rate !== undefined) {
    return `${metric.rate}%`
  }

  return new Intl.NumberFormat(locale.value).format(metric.value)
}
</script>
