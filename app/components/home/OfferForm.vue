<template>
  <section class="space-y-4" :aria-label="$t('home.offerForm.title')">
    <div>
      <h3 class="text-base font-semibold">{{ $t('home.offerForm.title') }}</h3>
      <p class="text-sm text-muted">{{ $t('home.offerForm.description') }}</p>
    </div>

    <form class="grid gap-3 rounded-lg border border-default p-4 md:grid-cols-2 xl:grid-cols-4" @submit.prevent="submitForm">
      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.offerForm.id') }}</span>
        <input v-model="form.id" required class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary">
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.offerForm.decision') }}</span>
        <select v-model="form.decision" required class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary">
          <option v-for="decisionId in offerDecisionIds" :key="decisionId" :value="decisionId">{{ $t(`domain.offerDecision.${decisionId}`) }}</option>
        </select>
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.offerForm.offeredAt') }}</span>
        <input v-model="form.offeredAt" class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary" type="datetime-local">
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.offerForm.decisionDueAt') }}</span>
        <input v-model="form.decisionDueAt" class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary" type="date">
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.form.salaryMin') }}</span>
        <input v-model="form.salaryMin" inputmode="numeric" class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary">
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.form.salaryMax') }}</span>
        <input v-model="form.salaryMax" inputmode="numeric" class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary">
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.form.currency') }}</span>
        <input v-model="form.currency" class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary">
      </label>

      <label class="space-y-1 text-sm md:col-span-2 xl:col-span-4">
        <span class="font-medium">{{ $t('home.details.notes') }}</span>
        <textarea v-model="form.notes" class="min-h-20 w-full rounded-md border border-default bg-default px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>

      <div class="flex flex-wrap items-center gap-3 md:col-span-2 xl:col-span-4">
        <UButton :loading="status === 'loading'" :disabled="status === 'loading' || !vacancyId" type="submit">{{ $t('home.offerForm.save') }}</UButton>
        <UButton :disabled="status === 'loading' || !vacancyId" color="neutral" type="button" variant="soft" @click="resetToBlank">{{ $t('home.offerForm.new') }}</UButton>
        <p v-if="status === 'loading'" class="text-sm text-muted">{{ $t('home.offerForm.loading') }}</p>
        <p v-if="status === 'success'" class="text-sm text-success">{{ $t('home.offerForm.success') }}</p>
        <p v-if="status === 'error'" class="text-sm text-error">{{ $t('home.offerForm.error') }}</p>
        <p v-if="!vacancyId" class="text-sm text-muted">{{ $t('home.offerForm.selectVacancyFirst') }}</p>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { offerDecisionIds } from '../../domain/offers'
import type { Offer } from '../../schemas/offers.schema'

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

interface OfferFormModel {
  currency: string
  decision: string
  decisionDueAt: string
  id: string
  notes: string
  offeredAt: string
  salaryMax: string
  salaryMin: string
  vacancyId: string
}

const props = defineProps<{
  offer: Offer | undefined
  status: FormStatus
  vacancyId: string | undefined
}>()

const emit = defineEmits<{
  resetStatus: []
  save: [payload: OfferFormModel]
}>()

const form = ref(createFormModel(props.vacancyId, props.offer))

watch(() => props.offer, (offer) => {
  form.value = createFormModel(props.vacancyId, offer)
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

function createFormModel(vacancyId: string | undefined, offer: Offer | undefined): OfferFormModel {
  return {
    currency: offer?.currency ?? '',
    decision: offer?.decision ?? 'pending',
    decisionDueAt: offer?.decisionDueAt?.slice(0, 10) ?? '',
    id: offer?.id ?? createUniqueId('offer'),
    notes: offer?.notes ?? '',
    offeredAt: toDatetimeLocal(offer?.offeredAt),
    salaryMax: offer?.salaryMax?.toString() ?? '',
    salaryMin: offer?.salaryMin?.toString() ?? '',
    vacancyId: offer?.vacancyId ?? vacancyId ?? '',
  }
}

function submitForm() {
  emit('resetStatus')
  emit('save', {
    ...form.value,
    offeredAt: fromDatetimeLocal(form.value.offeredAt),
    vacancyId: props.vacancyId ?? form.value.vacancyId,
  })
}

function resetToBlank() {
  emit('resetStatus')
  form.value = createFormModel(props.vacancyId, undefined)
}
</script>
