<template>
  <section class="space-y-4" :aria-label="$t('home.interviewForm.title')">
    <div>
      <h3 class="text-base font-semibold">{{ $t('home.interviewForm.title') }}</h3>
      <p class="text-sm text-muted">{{ $t('home.interviewForm.description') }}</p>
    </div>

    <form class="grid gap-3 rounded-lg border border-default p-4 md:grid-cols-2 xl:grid-cols-4" @submit.prevent="submitForm">
      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.interviewForm.id') }}</span>
        <input v-model="form.id" required class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary">
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.interviewForm.stage') }}</span>
        <select v-model="form.stage" required class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary">
          <option v-for="stageId in interviewStageIds" :key="stageId" :value="stageId">{{ $t(`domain.stage.${stageId}`) }}</option>
        </select>
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.interviewForm.result') }}</span>
        <select v-model="form.result" required class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary">
          <option v-for="resultId in interviewResultIds" :key="resultId" :value="resultId">{{ $t(`domain.interviewResult.${resultId}`) }}</option>
        </select>
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.interviewForm.scheduledAt') }}</span>
        <input v-model="form.scheduledAt" required class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary" type="datetime-local">
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.interviewForm.interviewers') }}</span>
        <input v-model="form.interviewerNames" class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary">
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.interviewForm.location') }}</span>
        <input v-model="form.location" class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary">
      </label>

      <label class="space-y-1 text-sm md:col-span-2 xl:col-span-4">
        <span class="font-medium">{{ $t('home.details.notes') }}</span>
        <textarea v-model="form.notes" class="min-h-20 w-full rounded-md border border-default bg-default px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>

      <div class="flex flex-wrap items-center gap-3 md:col-span-2 xl:col-span-4">
        <UButton :loading="status === 'loading'" :disabled="status === 'loading' || !vacancyId" type="submit">{{ $t('home.interviewForm.save') }}</UButton>
        <UButton :disabled="status === 'loading' || !vacancyId" color="neutral" type="button" variant="soft" @click="resetToBlank">{{ $t('home.interviewForm.new') }}</UButton>
        <p v-if="status === 'loading'" class="text-sm text-muted">{{ $t('home.interviewForm.loading') }}</p>
        <p v-if="status === 'success'" class="text-sm text-success">{{ $t('home.interviewForm.success') }}</p>
        <p v-if="status === 'error'" class="text-sm text-error">{{ $t('home.interviewForm.error') }}</p>
        <p v-if="!vacancyId" class="text-sm text-muted">{{ $t('home.interviewForm.selectVacancyFirst') }}</p>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { interviewResultIds, interviewStageIds } from '../../domain/interviews'
import type { Interview } from '../../schemas/interviews.schema'

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

interface InterviewFormModel {
  id: string
  interviewerNames: string
  location: string
  notes: string
  pipelineEventId: string
  result: string
  scheduledAt: string
  stage: string
  vacancyId: string
}

const props = defineProps<{
  interview: Interview | undefined
  status: FormStatus
  vacancyId: string | undefined
}>()

const emit = defineEmits<{
  resetStatus: []
  save: [payload: InterviewFormModel]
}>()

const form = ref(createFormModel(props.vacancyId, props.interview))

watch(() => props.interview, (interview) => {
  form.value = createFormModel(props.vacancyId, interview)
})

watch(() => props.vacancyId, (vacancyId) => {
  form.value = createFormModel(vacancyId, undefined)
})

function createUniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function toDatetimeLocal(value: string | undefined): string {
  return value === undefined ? '' : value.replace(/Z$/, '').slice(0, 16)
}

function fromDatetimeLocal(value: string): string {
  if (value.trim().length === 0) {
    return ''
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString()
}

function createFormModel(vacancyId: string | undefined, interview: Interview | undefined): InterviewFormModel {
  return {
    id: interview?.id ?? createUniqueId('interview'),
    interviewerNames: interview?.interviewerNames.join(', ') ?? '',
    location: interview?.location ?? '',
    notes: interview?.notes ?? '',
    pipelineEventId: interview?.pipelineEventId ?? '',
    result: interview?.result ?? 'pending',
    scheduledAt: toDatetimeLocal(interview?.scheduledAt),
    stage: interview?.stage ?? 'technical_screen',
    vacancyId: interview?.vacancyId ?? vacancyId ?? '',
  }
}

function submitForm() {
  emit('resetStatus')
  emit('save', {
    ...form.value,
    scheduledAt: fromDatetimeLocal(form.value.scheduledAt),
    vacancyId: props.vacancyId ?? form.value.vacancyId,
  })
}

function resetToBlank() {
  emit('resetStatus')
  form.value = createFormModel(props.vacancyId, undefined)
}
</script>
