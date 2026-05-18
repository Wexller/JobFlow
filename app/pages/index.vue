<template>
  <section class="space-y-8">
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

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <HomeActivePipelineTable :vacancies="activeVacancies" />
        <HomeNextActionsList :vacancies="nextActions" />
      </div>

      <section class="space-y-4">
        <div>
          <h2 class="text-xl font-semibold tracking-normal">
            {{ $t('home.vacancies.title') }}
          </h2>
          <p class="text-sm text-muted">
            {{ $t('home.vacancies.description') }}
          </p>
        </div>

        <HomeVacanciesFilters
          v-model="filters"
          v-model:sort="sortOption"
          :format-options="formatOptions"
          :is-ready="isReady"
          :level-options="levelOptions"
          :location-options="locationOptions"
          :priority-options="priorityOptions"
          :source-options="sourceOptions"
          :status-options="statusOptions"
          :tech-stack-options="techStackOptions"
          @reset="resetVacancyFilters"
        />

        <p
          v-if="isEmptyResult"
          class="rounded-lg border border-default bg-muted/20 p-4 text-sm text-muted"
        >
          {{ $t('home.state.empty') }}
        </p>

        <HomeVacanciesTable
          :vacancies="filteredVacancies"
          @select="selectedVacancyId = $event"
        />
      </section>

      <HomeVacancyForm
        :status="formStatus"
        :vacancy="selectedVacancyDetails?.vacancy"
        @reset-status="formStatus = 'idle'"
        @save="saveVacancy"
      />

      <HomePipelineEventForm
        :status="pipelineFormStatus"
        :pipeline-event="selectedPipelineEvent"
        :vacancy-id="selectedVacancyDetails?.vacancy.id"
        @reset-status="pipelineFormStatus = 'idle'"
        @save="savePipelineEvent"
      />

      <HomeInterviewForm
        :interview="selectedInterview"
        :status="interviewFormStatus"
        :vacancy-id="selectedVacancyDetails?.vacancy.id"
        @reset-status="interviewFormStatus = 'idle'"
        @save="saveInterview"
      />

      <HomeOfferForm
        :offer="selectedVacancyDetails?.offer"
        :status="offerFormStatus"
        :vacancy-id="selectedVacancyDetails?.vacancy.id"
        @reset-status="offerFormStatus = 'idle'"
        @save="saveOffer"
      />

      <HomeVacancyDetails :details="selectedVacancyDetails" />

      <HomeVacancyKanban
        :groups="store.kanbanGroups"
        :statuses="kanbanStatuses"
      />
    </template>
  </section>
</template>

<script setup lang="ts">
import { compareAsc, parseISO } from 'date-fns'
import type { FetchError } from 'ofetch'
import { useJobflowSnapshot } from '~/composables/useJobflowSnapshot'
import { useJobflowStore } from '~/stores/jobflow'
import { vacancyStatusIds } from '../domain/vacancies'
import type { SummaryMetric } from '../schemas/summary-metrics.schema'
import type { SortDirection, VacancySortKey } from '../stores/jobflow'
import type { VacancyFilterModel } from '../components/home/VacanciesFilters.vue'

const store = useJobflowStore()
const snapshotRequest = await useJobflowSnapshot()

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
const kanbanStatuses = vacancyStatusIds.filter((status) => status !== 'unknown')

const isReady = ref(false)
const formStatus = ref<'error' | 'idle' | 'loading' | 'success'>('idle')
const pipelineFormStatus = ref<'error' | 'idle' | 'loading' | 'success'>('idle')
const interviewFormStatus = ref<'error' | 'idle' | 'loading' | 'success'>('idle')
const offerFormStatus = ref<'error' | 'idle' | 'loading' | 'success'>('idle')
const selectedVacancyId = ref<string | undefined>(undefined)
const filters = ref<VacancyFilterModel>({
  format: 'all',
  level: 'all',
  location: 'all',
  priority: 'all',
  query: '',
  source: 'all',
  status: 'all',
  techStack: 'all',
})
const sortOption = ref(`${store.sort.key}:${store.sort.direction}`)

const activeVacancies = computed(() => store.activeVacancies)
const filteredVacancies = computed(() => store.filteredVacancies)
const isLoading = computed(() => snapshotRequest.status.value === 'pending' || snapshotRequest.status.value === 'idle')
const hasLoadError = computed(() => snapshotRequest.status.value === 'error' || store.sync.status === 'error')
const isEmptyResult = computed(() => snapshotRequest.status.value === 'success' && filteredVacancies.value.length === 0)
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
const selectedVacancyDetails = computed(() =>
  selectedVacancyId.value === undefined ? undefined : store.vacancyDetails(selectedVacancyId.value),
)
const selectedPipelineEvent = computed(() => selectedVacancyDetails.value?.pipelineEvents.at(-1))
const selectedInterview = computed(() => selectedVacancyDetails.value?.interviews.at(-1))

const statusOptions = computed(() => uniqueValues(store.vacancies.map((vacancy) => vacancy.status)))
const priorityOptions = computed(() => uniqueValues(store.vacancies.map((vacancy) => vacancy.priority)))
const formatOptions = computed(() => uniqueValues(store.vacancies.map((vacancy) => vacancy.format)))
const sourceOptions = computed(() => uniqueValues(store.vacancies.map((vacancy) => vacancy.source)))
const levelOptions = computed(() => uniqueValues(store.vacancies.map((vacancy) => vacancy.level)))
const locationOptions = computed(() => uniqueValues(store.vacancies.map((vacancy) => vacancy.location)))
const techStackOptions = computed(() => uniqueValues(store.vacancies.flatMap((vacancy) => vacancy.techStack)))

watch(filters, (value) => {
  store.setFilters({
    formats: value.format === 'all' ? [] : [value.format],
    levels: value.level === 'all' ? [] : [value.level],
    locations: value.location === 'all' ? [] : [value.location],
    priorities: value.priority === 'all' ? [] : [value.priority],
    query: value.query,
    sources: value.source === 'all' ? [] : [value.source],
    statuses: value.status === 'all' ? [] : [value.status],
    techStack: value.techStack === 'all' ? [] : [value.techStack],
  })
}, { deep: true, immediate: true })

watch(sortOption, (value) => {
  const [key, direction] = value.split(':') as [VacancySortKey, SortDirection]
  store.setSort({ direction, key })
}, { immediate: true })

watch(() => snapshotRequest.status.value, (status) => {
  if (status === 'pending' || status === 'idle') {
    store.setLoading()
  }

  if (status === 'error') {
    const errorState = resolveFetchError(snapshotRequest.error.value)
    store.setLoadError(errorState.message, errorState.requestId)
  }
}, { immediate: true })

watch(() => snapshotRequest.data.value, (snapshot) => {
  if (snapshot !== null && snapshot !== undefined) {
    store.applySnapshot(snapshot)
    if (selectedVacancyId.value === undefined && snapshot.vacancies.length > 0) {
      selectedVacancyId.value = snapshot.vacancies[0]?.id
    }
  }
}, { immediate: true })

onMounted(() => {
  isReady.value = true
})

function uniqueValues<T extends string>(values: readonly (T | undefined)[]): T[] {
  return [...new Set(values.filter((value): value is T => value !== undefined))].sort((first, second) => first.localeCompare(second))
}

function resetVacancyFilters() {
  filters.value = {
    format: 'all',
    level: 'all',
    location: 'all',
    priority: 'all',
    query: '',
    source: 'all',
    status: 'all',
    techStack: 'all',
  }
  sortOption.value = 'applied_at:desc'
  store.resetFilters()
  store.setSort({ direction: 'desc', key: 'applied_at' })
}

async function saveVacancy(payload: unknown) {
  formStatus.value = 'loading'
  const result = await store.saveVacancy(payload)

  if (result.ok) {
    selectedVacancyId.value = result.value.id
    formStatus.value = 'success'
  }
  else {
    formStatus.value = 'error'
  }
}

async function savePipelineEvent(payload: unknown) {
  pipelineFormStatus.value = 'loading'
  const result = await store.savePipelineEvent(payload)

  if (result.ok) {
    pipelineFormStatus.value = 'success'
  }
  else {
    pipelineFormStatus.value = 'error'
  }
}

async function saveInterview(payload: unknown) {
  interviewFormStatus.value = 'loading'
  const result = await store.saveInterview(payload)

  if (result.ok) {
    interviewFormStatus.value = 'success'
  }
  else {
    interviewFormStatus.value = 'error'
  }
}

async function saveOffer(payload: unknown) {
  offerFormStatus.value = 'loading'
  const result = await store.saveOffer(payload)

  if (result.ok) {
    offerFormStatus.value = 'success'
  }
  else {
    offerFormStatus.value = 'error'
  }
}

function reload() {
  void snapshotRequest.refresh()
}

function resolveFetchError(error: FetchError | null | undefined) {
  const errorData = error?.data as { message?: string, requestId?: string } | undefined

  return {
    message: errorData?.message ?? error?.statusMessage ?? error?.message ?? 'Request failed',
    requestId: errorData?.requestId,
  }
}
</script>
