<template>
  <section class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-normal">{{ $t('pipelineEventsPage.title') }}</h1>
      <p class="text-sm text-muted">{{ $t('pipelineEventsPage.description') }}</p>
    </div>

    <div v-if="isLoading" class="rounded-lg border border-default bg-muted/20 p-4 text-sm text-muted" role="status" aria-live="polite">
      {{ $t('pipelineEventsPage.state.loading') }}
    </div>

    <div v-else-if="errorMessage" class="space-y-2 rounded-lg border border-error/30 bg-error/5 p-4" role="alert">
      <p class="font-medium text-error">{{ $t('pipelineEventsPage.state.error') }}</p>
      <p class="text-sm text-muted">{{ errorMessage }}</p>
      <UButton color="neutral" variant="soft" @click="refresh">{{ $t('pipelineEventsPage.state.retry') }}</UButton>
    </div>

    <div v-else-if="events.length === 0" class="rounded-lg border border-default bg-muted/20 p-4 text-sm text-muted">
      {{ $t('pipelineEventsPage.state.empty') }}
    </div>

    <ul v-else class="space-y-3">
      <li v-for="event in events" :key="event.id" class="rounded-lg border border-default p-4">
        <p class="font-medium">{{ event.title }}</p>
        <p class="text-sm text-muted">{{ $t(`domain.stage.${event.stage}`) }} · {{ $t(`domain.stageStatus.${event.status}`) }}</p>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { PipelineEvent } from '~/schemas/pipeline.schema'
import { useJobflowSnapshot } from '~/composables/useJobflowSnapshot'

const request = await useJobflowSnapshot()
const { t } = useI18n()

const events = computed<PipelineEvent[]>(() => request.data.value?.pipelineEvents ?? [])
const isLoading = computed(() => request.status.value === 'pending' || request.status.value === 'idle')
const errorMessage = computed(() => {
  if (request.status.value !== 'error') {
    return undefined
  }

  const error = request.error.value
  const errorData = error?.data as { message?: string } | undefined
  return errorData?.message ?? error?.statusMessage ?? error?.message ?? t('pipelineEventsPage.state.requestFailed')
})

function refresh() {
  void request.refresh()
}
</script>
