<template>
  <section class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-normal">{{ $t('interviewsPage.title') }}</h1>
      <p class="text-sm text-muted">{{ $t('interviewsPage.description') }}</p>
    </div>

    <div v-if="isLoading" class="rounded-lg border border-default bg-muted/20 p-4 text-sm text-muted" role="status" aria-live="polite">
      {{ $t('interviewsPage.state.loading') }}
    </div>

    <div v-else-if="errorMessage" class="space-y-2 rounded-lg border border-error/30 bg-error/5 p-4" role="alert">
      <p class="font-medium text-error">{{ $t('interviewsPage.state.error') }}</p>
      <p class="text-sm text-muted">{{ errorMessage }}</p>
      <UButton color="neutral" variant="soft" @click="refresh">{{ $t('interviewsPage.state.retry') }}</UButton>
    </div>

    <div v-else-if="interviews.length === 0" class="rounded-lg border border-default bg-muted/20 p-4 text-sm text-muted">
      {{ $t('interviewsPage.state.empty') }}
    </div>

    <ul v-else class="space-y-3">
      <li v-for="interview in interviews" :key="interview.id" class="rounded-lg border border-default p-4">
        <p class="font-medium">{{ $t(`domain.stage.${interview.stage}`) }}</p>
        <p class="text-sm text-muted">{{ $t(`domain.interviewResult.${interview.result}`) }}</p>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { Interview } from '~/schemas/interviews.schema'
import { useJobflowSnapshot } from '~/composables/useJobflowSnapshot'

const request = await useJobflowSnapshot()
const { t } = useI18n()

const interviews = computed<Interview[]>(() => request.data.value?.interviews ?? [])
const isLoading = computed(() => request.status.value === 'pending' || request.status.value === 'idle')
const errorMessage = computed(() => {
  if (request.status.value !== 'error') {
    return undefined
  }

  const error = request.error.value
  const errorData = error?.data as { message?: string } | undefined
  return errorData?.message ?? error?.statusMessage ?? error?.message ?? t('interviewsPage.state.requestFailed')
})

function refresh() {
  void request.refresh()
}
</script>
