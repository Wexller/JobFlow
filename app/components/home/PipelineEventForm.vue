<template>
  <section class="space-y-4" :aria-label="$t('home.pipelineForm.title')">
    <div>
      <h3 class="text-base font-semibold">
        {{ $t('home.pipelineForm.title') }}
      </h3>
      <p class="text-sm text-muted">
        {{ $t('home.pipelineForm.description') }}
      </p>
    </div>

    <form class="grid gap-3 rounded-lg border border-default p-4 md:grid-cols-2 xl:grid-cols-4" @submit.prevent="submitForm">
      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.pipelineForm.id') }}</span>
        <input v-model="form.id" required class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary">
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.pipelineForm.stage') }}</span>
        <select v-model="form.stage" required class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary">
          <option v-for="stageId in pipelineStageIds" :key="stageId" :value="stageId">
            {{ $t(`domain.stage.${stageId}`) }}
          </option>
        </select>
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.pipelineForm.status') }}</span>
        <select v-model="form.status" required class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary">
          <option v-for="statusId in pipelineStageStatusIds" :key="statusId" :value="statusId">
            {{ $t(`domain.stageStatus.${statusId}`) }}
          </option>
        </select>
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.pipelineForm.titleField') }}</span>
        <input v-model="form.title" class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary">
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.pipelineForm.scheduledAt') }}</span>
        <input v-model="form.scheduledAt" class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary" type="datetime-local">
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.pipelineForm.occurredAt') }}</span>
        <input v-model="form.occurredAt" class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary" type="datetime-local">
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.pipelineForm.completedAt') }}</span>
        <input v-model="form.completedAt" class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary" type="datetime-local">
      </label>

      <label class="space-y-1 text-sm md:col-span-2 xl:col-span-4">
        <span class="font-medium">{{ $t('home.details.notes') }}</span>
        <textarea v-model="form.notes" class="min-h-20 w-full rounded-md border border-default bg-default px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>

      <div class="flex flex-wrap items-center gap-3 md:col-span-2 xl:col-span-4">
        <UButton type="submit">
          {{ $t('home.pipelineForm.save') }}
        </UButton>
        <UButton color="neutral" type="button" variant="soft" @click="resetToBlank">
          {{ $t('home.pipelineForm.new') }}
        </UButton>
        <p v-if="status === 'success'" class="text-sm text-success">
          {{ $t('home.pipelineForm.success') }}
        </p>
        <p v-if="status === 'error'" class="text-sm text-error">
          {{ $t('home.pipelineForm.error') }}
        </p>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { pipelineStageIds, pipelineStageStatusIds } from '../../domain/pipeline'
import type { PipelineEvent } from '../../schemas/pipeline.schema'

type FormStatus = 'idle' | 'success' | 'error'

interface PipelineEventFormModel {
  completedAt: string
  id: string
  notes: string
  occurredAt: string
  scheduledAt: string
  stage: string
  status: string
  title: string
  vacancyId: string
}

const props = defineProps<{
  status: FormStatus
  vacancyId: string | undefined
  pipelineEvent: PipelineEvent | undefined
}>()

const emit = defineEmits<{
  resetStatus: []
  save: [payload: PipelineEventFormModel]
}>()

const form = ref(createFormModel(props.vacancyId, props.pipelineEvent))

watch(() => props.pipelineEvent, (pipelineEvent) => {
  form.value = createFormModel(props.vacancyId, pipelineEvent)
})

watch(() => props.vacancyId, (vacancyId) => {
  form.value = createFormModel(vacancyId, undefined)
})

function createTimestamp(): string {
  return new Date().toISOString()
}

function toDatetimeLocal(value: string | undefined): string {
  return value === undefined ? '' : value.replace(/Z$/, '').slice(0, 16)
}

function fromDatetimeLocal(value: string): string {
  return value.trim().length === 0 ? '' : `${value}:00Z`
}

function createFormModel(vacancyId: string | undefined, pipelineEvent: PipelineEvent | undefined): PipelineEventFormModel {
  const timestamp = createTimestamp()

  return {
    completedAt: toDatetimeLocal(pipelineEvent?.completedAt),
    id: pipelineEvent?.id ?? `pipeline-${timestamp.slice(0, 10)}`,
    notes: pipelineEvent?.notes ?? '',
    occurredAt: toDatetimeLocal(pipelineEvent?.occurredAt),
    scheduledAt: toDatetimeLocal(pipelineEvent?.scheduledAt),
    stage: pipelineEvent?.stage ?? 'applied',
    status: pipelineEvent?.status ?? 'planned',
    title: pipelineEvent?.title ?? '',
    vacancyId: pipelineEvent?.vacancyId ?? vacancyId ?? '',
  }
}

function submitForm() {
  emit('resetStatus')
  emit('save', {
    ...form.value,
    completedAt: fromDatetimeLocal(form.value.completedAt),
    occurredAt: fromDatetimeLocal(form.value.occurredAt),
    scheduledAt: fromDatetimeLocal(form.value.scheduledAt),
    vacancyId: props.vacancyId ?? form.value.vacancyId,
  })
}

function resetToBlank() {
  emit('resetStatus')
  form.value = createFormModel(props.vacancyId, undefined)
}
</script>
