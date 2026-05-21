<template>
  <section class="space-y-6 sm:space-y-8">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-normal">{{ $t('offersPage.title') }}</h1>
      <p class="text-sm text-muted">{{ $t('offersPage.description') }}</p>
    </div>

    <div v-if="isLoading" class="rounded-lg border border-default bg-muted/20 p-4 text-sm text-muted" role="status" aria-live="polite">
      {{ $t('offersPage.state.loading') }}
    </div>

    <div v-else-if="errorMessage" class="space-y-2 rounded-lg border border-error/30 bg-error/5 p-4" role="alert">
      <p class="font-medium text-error">{{ $t('offersPage.state.error') }}</p>
      <p class="text-sm text-muted">{{ errorMessage }}</p>
      <UButton color="neutral" variant="soft" @click="reload">{{ $t('offersPage.state.retry') }}</UButton>
    </div>

    <template v-else>
      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('offersPage.selectVacancy') }}</span>
        <select v-model="selectedVacancyId" class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary">
          <option value="">{{ $t('offersPage.noVacancy') }}</option>
          <option v-for="vacancy in store.vacancies" :key="vacancy.id" :value="vacancy.id">
            {{ vacancy.company }} · {{ vacancy.role }}
          </option>
        </select>
      </label>

      <HomeOfferForm
        :offer="selectedOffer"
        :status="formStatus"
        :vacancy-id="selectedVacancyId || undefined"
        @reset-status="formStatus = 'idle'"
        @save="saveOffer"
      />

      <ul v-if="filteredOffers.length > 0" class="space-y-3">
        <li v-for="offer in filteredOffers" :key="offer.id" class="rounded-lg border border-default p-4">
          <p class="font-medium">{{ $t(`domain.offerDecision.${offer.decision}`) }}</p>
          <p class="text-sm text-muted">{{ offer.currency ?? '-' }} · {{ offer.salaryMax ?? offer.salaryMin ?? '-' }}</p>
        </li>
      </ul>

      <div v-else class="rounded-lg border border-default bg-muted/20 p-4 text-sm text-muted">
        {{ $t('offersPage.state.empty') }}
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import type { FetchError } from 'ofetch'
import { useJobflowSnapshot } from '~/composables/useJobflowSnapshot'
import { useJobflowStore } from '~/stores/jobflow'
import { defaultFormStatus, type FormStatus } from '../domain/jobflow'

const store = useJobflowStore()
const snapshotRequest = await useJobflowSnapshot()
const { t } = useI18n()

const selectedVacancyId = ref('')
const formStatus = ref<FormStatus>(defaultFormStatus)

const isLoading = computed(() => snapshotRequest.status.value === 'pending' || snapshotRequest.status.value === 'idle')
const errorMessage = computed(() => {
  if (!(snapshotRequest.status.value === 'error' || store.sync.status === 'error')) {
    return undefined
  }

  const errorData = (snapshotRequest.error.value as FetchError | null)?.data as { message?: string } | undefined
  return store.sync.errorMessage ?? errorData?.message ?? t('offersPage.state.requestFailed')
})
const filteredOffers = computed(() =>
  store.offers.filter((offer) => !selectedVacancyId.value || offer.vacancyId === selectedVacancyId.value),
)
const selectedOffer = computed(() => filteredOffers.value.at(-1))

watch(() => snapshotRequest.status.value, (status) => {
  if (status === 'pending' || status === 'idle') {
    store.setLoading()
  }
}, { immediate: true })

watch(() => snapshotRequest.data.value, (snapshot) => {
  if (snapshot) {
    store.applySnapshot(snapshot)
    if (!selectedVacancyId.value && snapshot.vacancies.length > 0) {
      selectedVacancyId.value = snapshot.vacancies[0]?.id ?? ''
    }
  }
}, { immediate: true })

async function saveOffer(payload: unknown) {
  formStatus.value = 'loading'
  const result = await store.saveOffer(payload)
  formStatus.value = result.ok ? 'success' : 'error'
}

async function reload() {
  await snapshotRequest.refresh()
}
</script>
