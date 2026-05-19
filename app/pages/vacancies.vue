<template>
  <section class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-normal">{{ $t('vacanciesPage.title') }}</h1>
      <p class="text-sm text-muted">{{ $t('vacanciesPage.description') }}</p>
    </div>

    <div v-if="isLoading" class="rounded-lg border border-default bg-muted/20 p-4 text-sm text-muted" role="status" aria-live="polite">
      {{ $t('vacanciesPage.state.loadingList') }}
    </div>

    <div v-else-if="loadError" class="space-y-2 rounded-lg border border-error/30 bg-error/5 p-4" role="alert">
      <p class="font-medium text-error">{{ $t('vacanciesPage.state.errorList') }}</p>
      <p class="text-sm text-muted">{{ loadError }}</p>
      <UButton color="neutral" variant="soft" @click="reload">{{ $t('vacanciesPage.state.retry') }}</UButton>
    </div>

    <template v-else>
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
        @reset="resetFilters"
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

      <HomeVacancyDetails :details="selectedVacancyDetails" />

      <HomeVacancyForm
        :status="formStatus"
        :vacancy="selectedVacancyDetails?.vacancy"
        @reset-status="formStatus = 'idle'"
        @save="saveVacancy"
      />
    </template>
  </section>
</template>

<script setup lang="ts">
import type { FetchError } from 'ofetch'
import { useJobflowSnapshot } from '~/composables/useJobflowSnapshot'
import { useJobflowStore } from '~/stores/jobflow'
import type { SortDirection, VacancySortKey } from '../stores/jobflow'
import type { VacancyFilterModel } from '../components/home/VacanciesFilters.vue'

const store = useJobflowStore()
const snapshotRequest = await useJobflowSnapshot()
const { t } = useI18n()

const formStatus = ref<'error' | 'idle' | 'loading' | 'success'>('idle')
const isReady = ref(false)
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

const isLoading = computed(() => snapshotRequest.status.value === 'pending' || snapshotRequest.status.value === 'idle')
const loadError = computed(() => {
  if (!(snapshotRequest.status.value === 'error' || store.sync.status === 'error')) {
    return undefined
  }

  const errorData = (snapshotRequest.error.value as FetchError | null)?.data as { message?: string } | undefined
  return store.sync.errorMessage ?? errorData?.message ?? t('vacanciesPage.state.requestFailed')
})
const filteredVacancies = computed(() => store.filteredVacancies)
const isEmptyResult = computed(() => snapshotRequest.status.value === 'success' && filteredVacancies.value.length === 0)
const selectedVacancyDetails = computed(() =>
  selectedVacancyId.value === undefined ? undefined : store.vacancyDetails(selectedVacancyId.value),
)

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
    const errorData = (snapshotRequest.error.value as FetchError | null)?.data as { message?: string, requestId?: string } | undefined
    store.setLoadError(errorData?.message ?? t('vacanciesPage.state.requestFailed'), errorData?.requestId)
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

function resetFilters() {
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

async function reload() {
  await snapshotRequest.refresh()
}

async function saveVacancy(payload: unknown) {
  formStatus.value = 'loading'
  const result = await store.saveVacancy(payload)

  if (result.ok) {
    selectedVacancyId.value = result.value.id
    formStatus.value = 'success'
    return
  }

  formStatus.value = 'error'
}
</script>
