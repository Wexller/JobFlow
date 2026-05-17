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

    <section class="space-y-4">
      <div>
        <h2 class="text-xl font-semibold tracking-normal">
          {{ $t('home.vacancies.title') }}
        </h2>
        <p class="text-sm text-muted">
          {{ $t('home.vacancies.description') }}
        </p>
      </div>

      <div class="grid gap-3 rounded-lg border border-default p-4 md:grid-cols-2 xl:grid-cols-4">
        <label class="space-y-1 text-sm">
          <span class="font-medium">{{ $t('home.filters.search') }}</span>
          <input
            v-model="queryFilter"
            class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary"
            :disabled="!isReady"
            :placeholder="$t('home.filters.searchPlaceholder')"
            type="search"
          >
        </label>

        <label class="space-y-1 text-sm">
          <span class="font-medium">{{ $t('home.filters.status') }}</span>
          <select
            v-model="statusFilter"
            :aria-label="$t('home.filters.statusAria')"
            class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary"
            :disabled="!isReady"
          >
            <option value="all">
              {{ $t('home.filters.all') }}
            </option>
            <option v-for="status in statusOptions" :key="status" :value="status">
              {{ $t(`domain.status.${status}`) }}
            </option>
          </select>
        </label>

        <label class="space-y-1 text-sm">
          <span class="font-medium">{{ $t('home.filters.priority') }}</span>
          <select
            v-model="priorityFilter"
            class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary"
            :disabled="!isReady"
          >
            <option value="all">
              {{ $t('home.filters.all') }}
            </option>
            <option v-for="priority in priorityOptions" :key="priority" :value="priority">
              {{ $t(`domain.priority.${priority}`) }}
            </option>
          </select>
        </label>

        <label class="space-y-1 text-sm">
          <span class="font-medium">{{ $t('home.filters.format') }}</span>
          <select
            v-model="formatFilter"
            class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary"
            :disabled="!isReady"
          >
            <option value="all">
              {{ $t('home.filters.all') }}
            </option>
            <option v-for="format in formatOptions" :key="format" :value="format">
              {{ $t(`domain.format.${format}`) }}
            </option>
          </select>
        </label>

        <label class="space-y-1 text-sm">
          <span class="font-medium">{{ $t('home.filters.source') }}</span>
          <select
            v-model="sourceFilter"
            class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary"
            :disabled="!isReady"
          >
            <option value="all">
              {{ $t('home.filters.all') }}
            </option>
            <option v-for="source in sourceOptions" :key="source" :value="source">
              {{ source }}
            </option>
          </select>
        </label>

        <label class="space-y-1 text-sm">
          <span class="font-medium">{{ $t('home.filters.level') }}</span>
          <select
            v-model="levelFilter"
            class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary"
            :disabled="!isReady"
          >
            <option value="all">
              {{ $t('home.filters.all') }}
            </option>
            <option v-for="level in levelOptions" :key="level" :value="level">
              {{ level }}
            </option>
          </select>
        </label>

        <label class="space-y-1 text-sm">
          <span class="font-medium">{{ $t('home.filters.location') }}</span>
          <select
            v-model="locationFilter"
            class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary"
            :disabled="!isReady"
          >
            <option value="all">
              {{ $t('home.filters.all') }}
            </option>
            <option v-for="location in locationOptions" :key="location" :value="location">
              {{ location }}
            </option>
          </select>
        </label>

        <label class="space-y-1 text-sm">
          <span class="font-medium">{{ $t('home.filters.techStack') }}</span>
          <select
            v-model="techStackFilter"
            class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary"
            :disabled="!isReady"
          >
            <option value="all">
              {{ $t('home.filters.all') }}
            </option>
            <option v-for="tech in techStackOptions" :key="tech" :value="tech">
              {{ tech }}
            </option>
          </select>
        </label>

        <label class="space-y-1 text-sm md:col-span-2 xl:col-span-3">
          <span class="font-medium">{{ $t('home.filters.sort') }}</span>
          <select
            v-model="sortOption"
            class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary"
            :disabled="!isReady"
          >
            <option value="applied_at:desc">
              {{ $t('home.sort.appliedDesc') }}
            </option>
            <option value="applied_at:asc">
              {{ $t('home.sort.appliedAsc') }}
            </option>
            <option value="priority:desc">
              {{ $t('home.sort.priorityDesc') }}
            </option>
            <option value="match_score:desc">
              {{ $t('home.sort.matchScoreDesc') }}
            </option>
            <option value="salary:desc">
              {{ $t('home.sort.salaryDesc') }}
            </option>
          </select>
        </label>

        <div class="flex items-end">
          <UButton block color="neutral" :disabled="!isReady" variant="soft" @click="resetVacancyFilters">
            {{ $t('home.filters.reset') }}
          </UButton>
        </div>
      </div>

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
            <tr v-for="vacancy in filteredVacancies" :key="vacancy.id">
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
                  <UButton
                    color="neutral"
                    size="xs"
                    variant="ghost"
                    @click="selectedVacancyId = vacancy.id"
                  >
                    {{ $t('home.details.open') }}
                  </UButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="selectedVacancyDetails" class="space-y-4" :aria-label="$t('home.details.title')">
      <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 class="text-xl font-semibold tracking-normal">
            {{ selectedVacancyDetails.vacancy.company }}
          </h2>
          <p class="text-sm text-muted">
            {{ selectedVacancyDetails.vacancy.role }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <UBadge color="primary" variant="soft">
            {{ $t(`domain.status.${selectedVacancyDetails.vacancy.status}`) }}
          </UBadge>
          <UBadge color="neutral" variant="soft">
            {{ $t(`domain.priority.${selectedVacancyDetails.vacancy.priority}`) }}
          </UBadge>
          <UBadge color="neutral" variant="soft">
            {{ $t(`domain.format.${selectedVacancyDetails.vacancy.format}`) }}
          </UBadge>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-3">
        <UCard>
          <template #header>
            <h3 class="text-base font-semibold">
              {{ $t('home.details.mainInfo') }}
            </h3>
          </template>
          <dl class="space-y-3 text-sm">
            <div class="flex justify-between gap-3">
              <dt class="text-muted">
                {{ $t('home.table.location') }}
              </dt>
              <dd>{{ selectedVacancyDetails.vacancy.location ?? '—' }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-muted">
                {{ $t('home.table.salary') }}
              </dt>
              <dd>{{ formatSalary(selectedVacancyDetails.vacancy) }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-muted">
                {{ $t('home.table.nextAction') }}
              </dt>
              <dd>{{ formatDate(selectedVacancyDetails.vacancy.nextActionAt) }}</dd>
            </div>
            <div>
              <dt class="text-muted">
                {{ $t('home.details.techStack') }}
              </dt>
              <dd class="mt-2 flex flex-wrap gap-2">
                <UBadge
                  v-for="tech in selectedVacancyDetails.vacancy.techStack"
                  :key="tech"
                  color="neutral"
                  variant="soft"
                >
                  {{ tech }}
                </UBadge>
              </dd>
            </div>
          </dl>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-base font-semibold">
              {{ $t('home.details.timeline') }}
            </h3>
          </template>
          <ol class="space-y-3">
            <li
              v-for="event in selectedVacancyDetails.pipelineEvents"
              :key="event.id"
              class="rounded-md border border-default p-3 text-sm"
            >
              <p class="font-medium">
                {{ event.title ?? $t(`domain.stage.${event.stage}`) }}
              </p>
              <p class="text-muted">
                {{ $t(`domain.stage.${event.stage}`) }} · {{ $t(`domain.stageStatus.${event.status}`) }} · {{ formatDate(event.scheduledAt ?? event.occurredAt ?? event.completedAt) }}
              </p>
            </li>
          </ol>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-base font-semibold">
              {{ $t('home.details.interviews') }}
            </h3>
          </template>
          <div class="space-y-3">
            <article
              v-for="interview in selectedVacancyDetails.interviews"
              :key="interview.id"
              class="rounded-md border border-default p-3 text-sm"
            >
              <p class="font-medium">
                {{ $t(`domain.stage.${interview.stage}`) }}
              </p>
              <p class="text-muted">
                {{ formatDate(interview.scheduledAt) }} · {{ $t(`domain.interviewResult.${interview.result}`) }}
              </p>
              <p v-if="interview.interviewerNames.length > 0" class="mt-2 text-muted">
                {{ interview.interviewerNames.join(', ') }}
              </p>
            </article>

            <p v-if="selectedVacancyDetails.interviews.length === 0" class="text-sm text-muted">
              {{ $t('home.details.noInterviews') }}
            </p>
          </div>
        </UCard>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <UCard>
          <template #header>
            <h3 class="text-base font-semibold">
              {{ $t('home.details.offer') }}
            </h3>
          </template>
          <div v-if="selectedVacancyDetails.offer" class="space-y-2 text-sm">
            <p>
              {{ $t(`domain.offerDecision.${selectedVacancyDetails.offer.decision}`) }}
            </p>
            <p class="text-muted">
              {{ formatMoneyRange(selectedVacancyDetails.offer) }}
            </p>
            <p class="text-muted">
              {{ $t('home.details.decisionDue') }}: {{ formatDate(selectedVacancyDetails.offer.decisionDueAt) }}
            </p>
          </div>
          <p v-else class="text-sm text-muted">
            {{ $t('home.details.noOffer') }}
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-base font-semibold">
              {{ $t('home.details.notes') }}
            </h3>
          </template>
          <p class="text-sm text-muted">
            {{ selectedVacancyDetails.vacancy.notes ?? $t('home.details.noNotes') }}
          </p>
        </UCard>
      </div>
    </section>

    <section class="space-y-4" :aria-label="$t('home.kanban.title')">
      <div>
        <h2 class="text-xl font-semibold tracking-normal">
          {{ $t('home.kanban.title') }}
        </h2>
        <p class="text-sm text-muted">
          {{ $t('home.kanban.description') }}
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="status in kanbanStatuses"
          :key="status"
          class="min-h-40 rounded-lg border border-default bg-muted/20"
        >
          <div class="flex items-center justify-between gap-3 border-b border-default px-4 py-3">
            <h3 class="text-sm font-semibold">
              {{ $t(`domain.status.${status}`) }}
            </h3>
            <UBadge color="neutral" variant="soft">
              {{ store.kanbanGroups[status].length }}
            </UBadge>
          </div>

          <div class="space-y-3 p-3">
            <article
              v-for="vacancy in store.kanbanGroups[status]"
              :key="vacancy.id"
              class="rounded-md border border-default bg-default p-3"
            >
              <div class="space-y-2">
                <div>
                  <p class="text-sm font-medium">
                    {{ vacancy.company }}
                  </p>
                  <p class="text-xs text-muted">
                    {{ vacancy.role }}
                  </p>
                </div>
                <div class="flex items-center justify-between gap-2 text-xs text-muted">
                  <span>{{ $t(`domain.priority.${vacancy.priority}`) }}</span>
                  <span>{{ formatDate(vacancy.nextActionAt) }}</span>
                </div>
              </div>
            </article>

            <p v-if="store.kanbanGroups[status].length === 0" class="px-1 py-4 text-sm text-muted">
              {{ $t('home.kanban.empty') }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { compareAsc, parseISO } from 'date-fns'
import { useJobflowStore } from '~/stores/jobflow'
import type { SummaryMetric } from '../schemas/summary-metrics.schema'
import { vacancyStatusIds, type VacancyPriorityId, type VacancyStatusId, type WorkFormatId } from '../domain/vacancies'
import type { VacancySortKey, SortDirection } from '../stores/jobflow'
import type { Vacancy } from '../schemas/vacancies.schema'
import type { Offer } from '../schemas/offers.schema'

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
const kanbanStatuses = vacancyStatusIds.filter((status) => status !== 'unknown')

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

const dateFormatter = computed(() =>
  new Intl.DateTimeFormat(locale.value, {
    day: 'numeric',
    month: 'short',
  }),
)
const moneyFormatter = computed(() =>
  new Intl.NumberFormat(locale.value, {
    maximumFractionDigits: 0,
  }),
)
const queryFilter = ref('')
const isReady = ref(false)
const selectedVacancyId = ref('vacancy-frontend-platform')
const statusFilter = ref<VacancyStatusId | 'all'>('all')
const priorityFilter = ref<VacancyPriorityId | 'all'>('all')
const formatFilter = ref<WorkFormatId | 'all'>('all')
const sourceFilter = ref('all')
const levelFilter = ref('all')
const locationFilter = ref('all')
const techStackFilter = ref('all')
const sortOption = ref(`${store.sort.key}:${store.sort.direction}`)

const statusOptions = computed(() => uniqueValues(store.vacancies.map((vacancy) => vacancy.status)))
const priorityOptions = computed(() => uniqueValues(store.vacancies.map((vacancy) => vacancy.priority)))
const formatOptions = computed(() => uniqueValues(store.vacancies.map((vacancy) => vacancy.format)))
const sourceOptions = computed(() => uniqueValues(store.vacancies.map((vacancy) => vacancy.source)))
const levelOptions = computed(() => uniqueValues(store.vacancies.map((vacancy) => vacancy.level)))
const locationOptions = computed(() => uniqueValues(store.vacancies.map((vacancy) => vacancy.location)))
const techStackOptions = computed(() => uniqueValues(store.vacancies.flatMap((vacancy) => vacancy.techStack)))
const selectedVacancyDetails = computed(() => store.vacancyDetails(selectedVacancyId.value))

watchEffect(() => {
  store.setFilters({
    formats: formatFilter.value === 'all' ? [] : [formatFilter.value],
    levels: levelFilter.value === 'all' ? [] : [levelFilter.value],
    locations: locationFilter.value === 'all' ? [] : [locationFilter.value],
    priorities: priorityFilter.value === 'all' ? [] : [priorityFilter.value],
    query: queryFilter.value,
    sources: sourceFilter.value === 'all' ? [] : [sourceFilter.value],
    statuses: statusFilter.value === 'all' ? [] : [statusFilter.value],
    techStack: techStackFilter.value === 'all' ? [] : [techStackFilter.value],
  })
})

onMounted(() => {
  isReady.value = true
})

watchEffect(() => {
  const [key, direction] = sortOption.value.split(':') as [VacancySortKey, SortDirection]
  store.setSort({ direction, key })
})

function uniqueValues<T extends string>(values: readonly (T | undefined)[]): T[] {
  return [...new Set(values.filter((value): value is T => value !== undefined))].sort((first, second) => first.localeCompare(second))
}

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

function formatOptionalNumber(value: number | undefined): string {
  return value === undefined ? '—' : new Intl.NumberFormat(locale.value).format(value)
}

function formatMoneyRange(rangeValue: Pick<Vacancy | Offer, 'currency' | 'salaryMax' | 'salaryMin'>): string {
  if (rangeValue.salaryMin === undefined && rangeValue.salaryMax === undefined) {
    return '—'
  }

  const range = [rangeValue.salaryMin, rangeValue.salaryMax]
    .filter((value): value is number => value !== undefined)
    .map((value) => moneyFormatter.value.format(value))
    .join('–')

  return rangeValue.currency === undefined ? range : `${range} ${rangeValue.currency}`
}

function formatSalary(vacancy: Vacancy): string {
  return formatMoneyRange(vacancy)
}

function resetVacancyFilters() {
  queryFilter.value = ''
  statusFilter.value = 'all'
  priorityFilter.value = 'all'
  formatFilter.value = 'all'
  sourceFilter.value = 'all'
  levelFilter.value = 'all'
  locationFilter.value = 'all'
  techStackFilter.value = 'all'
  sortOption.value = 'applied_at:desc'
  store.resetFilters()
  store.setSort({ direction: 'desc', key: 'applied_at' })
}
</script>
