<template>
  <section class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-normal">{{ $t('vacanciesPage.title') }}</h1>
      <p class="text-sm text-muted">{{ $t('vacanciesPage.description') }}</p>
    </div>

    <div v-if="isListLoading" class="rounded-lg border border-default bg-muted/20 p-4 text-sm text-muted" role="status" aria-live="polite">
      {{ $t('vacanciesPage.state.loadingList') }}
    </div>

    <div v-else-if="listErrorMessage" class="space-y-2 rounded-lg border border-error/30 bg-error/5 p-4" role="alert">
      <p class="font-medium text-error">{{ $t('vacanciesPage.state.errorList') }}</p>
      <p class="text-sm text-muted">{{ listErrorMessage }}</p>
      <UButton color="neutral" variant="soft" @click="refreshList">{{ $t('vacanciesPage.state.retry') }}</UButton>
    </div>

    <template v-else>
      <div v-if="vacancies.length === 0" class="rounded-lg border border-default bg-muted/20 p-4 text-sm text-muted">
        {{ $t('vacanciesPage.state.emptyList') }}
      </div>

      <div v-else class="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <aside class="rounded-lg border border-default p-3" :aria-label="$t('vacanciesPage.list.aria')">
          <ul class="space-y-2">
            <li v-for="vacancy in vacancies" :key="vacancy.id">
              <button
                class="w-full rounded-md border px-3 py-2 text-left text-sm transition"
                :class="selectedVacancyId === vacancy.id ? 'border-primary bg-primary/10' : 'border-default hover:bg-muted/30'"
                type="button"
                @click="selectedVacancyId = vacancy.id"
              >
                <p class="font-medium">{{ vacancy.company }}</p>
                <p class="text-xs text-muted">{{ vacancy.role }}</p>
              </button>
            </li>
          </ul>
        </aside>

        <section class="space-y-3" :aria-label="$t('vacanciesPage.details.aria')">
          <div v-if="isDetailsLoading" class="rounded-lg border border-default bg-muted/20 p-4 text-sm text-muted" role="status" aria-live="polite">
            {{ $t('vacanciesPage.state.loadingDetails') }}
          </div>

          <div v-else-if="detailsErrorMessage" class="space-y-2 rounded-lg border border-error/30 bg-error/5 p-4" role="alert">
            <p class="font-medium text-error">{{ $t('vacanciesPage.state.errorDetails') }}</p>
            <p class="text-sm text-muted">{{ detailsErrorMessage }}</p>
            <UButton color="neutral" variant="soft" @click="refreshDetails">{{ $t('vacanciesPage.state.retry') }}</UButton>
          </div>

          <HomeVacancyDetails v-else :details="selectedVacancyDetails" />
        </section>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import type { Vacancy } from '../schemas/vacancies.schema'
import type { VacancyDetails } from '../schemas/jobflow.schema'

const selectedVacancyId = ref<string | undefined>()

const listRequest = await useFetch<Vacancy[]>('/api/vacancies', {
  default: () => [],
  key: 'vacancies-list',
})

watch(() => listRequest.data.value, (items) => {
  if ((items?.length ?? 0) > 0 && selectedVacancyId.value === undefined) {
    selectedVacancyId.value = items[0]?.id
  }
}, { immediate: true })

const detailsRequest = await useLazyFetch<VacancyDetails>(
  () => `/api/vacancies/${encodeURIComponent(selectedVacancyId.value ?? '')}`,
  {
    default: () => undefined,
    immediate: false,
    key: 'vacancies-details',
  },
)

watch(selectedVacancyId, async (vacancyId) => {
  if (vacancyId !== undefined) {
    await detailsRequest.execute()
  }
}, { immediate: true })

const vacancies = computed(() => listRequest.data.value ?? [])
const selectedVacancyDetails = computed(() => detailsRequest.data.value)
const isListLoading = computed(() => listRequest.status.value === 'pending' || listRequest.status.value === 'idle')
const isDetailsLoading = computed(() => selectedVacancyId.value !== undefined && (detailsRequest.status.value === 'pending' || detailsRequest.status.value === 'idle'))

const listErrorMessage = computed(() => {
  if (listRequest.status.value !== 'error') {
    return undefined
  }

  const error = listRequest.error.value
  const errorData = error?.data as { message?: string } | undefined
  return errorData?.message ?? error?.statusMessage ?? error?.message ?? 'Request failed'
})

const detailsErrorMessage = computed(() => {
  if (detailsRequest.status.value !== 'error') {
    return undefined
  }

  const error = detailsRequest.error.value
  const errorData = error?.data as { message?: string } | undefined
  return errorData?.message ?? error?.statusMessage ?? error?.message ?? 'Request failed'
})

function refreshList() {
  void listRequest.refresh()
}

function refreshDetails() {
  if (selectedVacancyId.value !== undefined) {
    void detailsRequest.refresh()
  }
}
</script>
