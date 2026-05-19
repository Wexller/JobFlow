<template>
  <section class="space-y-6 sm:space-y-8">
    <HomePageHero />

    <div
      v-if="isLoading"
      class="rounded-xl border border-default bg-muted/20 p-8 text-sm text-muted"
      role="status"
      aria-live="polite"
    >
      {{ $t('home.state.loading') }}
    </div>

    <div
      v-else-if="hasLoadError"
      class="space-y-3 rounded-xl border border-error/30 bg-error/5 p-6"
      role="alert"
    >
      <p class="font-medium text-error">
        {{ $t('home.state.error') }}
      </p>
      <p v-if="store.sync.errorMessage" class="text-sm text-muted">
        {{ store.sync.errorMessage }}
      </p>
      <p v-if="store.sync.requestId" class="text-xs text-muted">
        {{ $t('home.state.requestId') }}: {{ store.sync.requestId }}
      </p>
      <UButton color="neutral" variant="soft" @click="reload">
        {{ $t('home.state.retry') }}
      </UButton>
    </div>

    <template v-else>
      <HomeDashboardMetrics :metrics="visibleMetrics" />

      <section class="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
        <NuxtLinkLocale
          v-for="link in entityLinks"
          :key="link.to"
          :to="link.to"
          class="rounded-xl border border-default bg-default p-4 transition hover:bg-muted/20"
        >
          <p class="text-sm font-medium">{{ link.title }}</p>
          <p class="mt-1 text-xs text-muted">{{ link.description }}</p>
        </NuxtLinkLocale>
      </section>

      <div class="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <HomeActivePipelineTable :vacancies="activeVacancies" />
        <HomeNextActionsList :vacancies="nextActions" />
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { compareAsc, parseISO } from 'date-fns'
import type { FetchError } from 'ofetch'
import { useJobflowSnapshot } from '~/composables/useJobflowSnapshot'
import { useJobflowStore } from '~/stores/jobflow'
import type { SummaryMetric } from '../schemas/summary-metrics.schema'

const store = useJobflowStore()
const snapshotRequest = await useJobflowSnapshot()
const { t } = useI18n()

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
const isLoading = computed(() => snapshotRequest.status.value === 'pending' || snapshotRequest.status.value === 'idle')
const hasLoadError = computed(() => snapshotRequest.status.value === 'error' || store.sync.status === 'error')
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
const entityLinks = computed(() => [
  {
    description: t('home.entities.vacanciesDescription'),
    title: t('home.entities.vacancies'),
    to: '/vacancies',
  },
  {
    description: t('home.entities.pipelineDescription'),
    title: t('home.entities.pipeline'),
    to: '/pipeline-events',
  },
  {
    description: t('home.entities.interviewsDescription'),
    title: t('home.entities.interviews'),
    to: '/interviews',
  },
  {
    description: t('home.entities.offersDescription'),
    title: t('home.entities.offers'),
    to: '/offers',
  },
])

watch(() => snapshotRequest.status.value, (status) => {
  if (status === 'pending' || status === 'idle') {
    store.setLoading()
  }

  if (status === 'error') {
    const errorState = resolveFetchError(snapshotRequest.error.value ?? null)
    store.setLoadError(errorState.message, errorState.requestId)
  }
}, { immediate: true })

watch(() => snapshotRequest.data.value, (snapshot) => {
  if (snapshot !== null && snapshot !== undefined) {
    store.applySnapshot(snapshot)
  }
}, { immediate: true })

function resolveFetchError(error: FetchError | null): { message: string, requestId?: string } {
  const errorData = error?.data as { message?: string, requestId?: string } | undefined

  return {
    message: errorData?.message ?? error?.statusMessage ?? error?.message ?? t('home.state.error'),
    requestId: errorData?.requestId,
  }
}

async function reload() {
  await snapshotRequest.refresh()
}
</script>
