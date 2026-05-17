<template>
  <section class="space-y-8">
    <HomePageHero />

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

      <HomeVacanciesTable
        :vacancies="filteredVacancies"
        @select="selectedVacancyId = $event"
      />
    </section>

    <HomeVacancyDetails :details="selectedVacancyDetails" />

    <HomeVacancyKanban
      :groups="store.kanbanGroups"
      :statuses="kanbanStatuses"
    />
  </section>
</template>

<script setup lang="ts">
import { compareAsc, parseISO } from 'date-fns'
import { useJobflowStore } from '~/stores/jobflow'
import { vacancyStatusIds } from '../domain/vacancies'
import type { SummaryMetric } from '../schemas/summary-metrics.schema'
import type { SortDirection, VacancySortKey } from '../stores/jobflow'
import type { VacancyFilterModel } from '../components/home/VacanciesFilters.vue'

const store = useJobflowStore()

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
const kanbanStatuses = vacancyStatusIds.filter((status) => status !== 'unknown')

const isReady = ref(false)
const selectedVacancyId = ref('vacancy-frontend-platform')
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
const selectedVacancyDetails = computed(() => store.vacancyDetails(selectedVacancyId.value))

const statusOptions = computed(() => uniqueValues(store.vacancies.map((vacancy) => vacancy.status)))
const priorityOptions = computed(() => uniqueValues(store.vacancies.map((vacancy) => vacancy.priority)))
const formatOptions = computed(() => uniqueValues(store.vacancies.map((vacancy) => vacancy.format)))
const sourceOptions = computed(() => uniqueValues(store.vacancies.map((vacancy) => vacancy.source)))
const levelOptions = computed(() => uniqueValues(store.vacancies.map((vacancy) => vacancy.level)))
const locationOptions = computed(() => uniqueValues(store.vacancies.map((vacancy) => vacancy.location)))
const techStackOptions = computed(() => uniqueValues(store.vacancies.flatMap((vacancy) => vacancy.techStack)))

watchEffect(() => {
  store.setFilters({
    formats: filters.value.format === 'all' ? [] : [filters.value.format],
    levels: filters.value.level === 'all' ? [] : [filters.value.level],
    locations: filters.value.location === 'all' ? [] : [filters.value.location],
    priorities: filters.value.priority === 'all' ? [] : [filters.value.priority],
    query: filters.value.query,
    sources: filters.value.source === 'all' ? [] : [filters.value.source],
    statuses: filters.value.status === 'all' ? [] : [filters.value.status],
    techStack: filters.value.techStack === 'all' ? [] : [filters.value.techStack],
  })
})

watchEffect(() => {
  const [key, direction] = sortOption.value.split(':') as [VacancySortKey, SortDirection]
  store.setSort({ direction, key })
})

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
</script>
