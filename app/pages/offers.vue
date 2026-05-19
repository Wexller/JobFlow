<template>
  <section class="space-y-6">
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
      <UButton color="neutral" variant="soft" @click="refresh">{{ $t('offersPage.state.retry') }}</UButton>
    </div>

    <div v-else-if="offers.length === 0" class="rounded-lg border border-default bg-muted/20 p-4 text-sm text-muted">
      {{ $t('offersPage.state.empty') }}
    </div>

    <ul v-else class="space-y-3">
      <li v-for="offer in offers" :key="offer.id" class="rounded-lg border border-default p-4">
        <p class="font-medium">{{ $t(`domain.offerDecision.${offer.decision}`) }}</p>
        <p class="text-sm text-muted">{{ offer.currency ?? '-' }} · {{ offer.salaryMax ?? offer.salaryMin ?? '-' }}</p>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { Offer } from '~/schemas/offers.schema'
import { useJobflowSnapshot } from '~/composables/useJobflowSnapshot'

const request = await useJobflowSnapshot()
const { t } = useI18n()

const offers = computed<Offer[]>(() => request.data.value?.offers ?? [])
const isLoading = computed(() => request.status.value === 'pending' || request.status.value === 'idle')
const errorMessage = computed(() => {
  if (request.status.value !== 'error') {
    return undefined
  }

  const error = request.error.value
  const errorData = error?.data as { message?: string } | undefined
  return errorData?.message ?? error?.statusMessage ?? error?.message ?? t('offersPage.state.requestFailed')
})

function refresh() {
  void request.refresh()
}
</script>
