<template>
  <section class="space-y-4" :aria-label="$t('home.form.title')">
    <div>
      <h2 class="text-xl font-semibold tracking-normal">
        {{ $t('home.form.title') }}
      </h2>
      <p class="text-sm text-muted">
        {{ $t('home.form.description') }}
      </p>
    </div>

    <form class="grid gap-3 rounded-lg border border-default p-4 md:grid-cols-2 xl:grid-cols-4" @submit.prevent="submitForm">
      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.form.id') }}</span>
        <input v-model="form.id" required class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary">
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.table.company') }}</span>
        <input v-model="form.company" required class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary">
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.table.role') }}</span>
        <input v-model="form.role" required class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary">
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.table.status') }}</span>
        <select v-model="form.status" required class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary">
          <option v-for="statusId in vacancyStatusIds" :key="statusId" :value="statusId">
            {{ $t(`domain.status.${statusId}`) }}
          </option>
        </select>
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.table.priority') }}</span>
        <select v-model="form.priority" required class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary">
          <option v-for="priority in vacancyPriorityIds" :key="priority" :value="priority">
            {{ $t(`domain.priority.${priority}`) }}
          </option>
        </select>
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.table.format') }}</span>
        <select v-model="form.format" required class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary">
          <option v-for="format in workFormatIds" :key="format" :value="format">
            {{ $t(`domain.format.${format}`) }}
          </option>
        </select>
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.filters.source') }}</span>
        <input v-model="form.source" class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary">
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.table.location') }}</span>
        <input v-model="form.location" class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary">
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.filters.level') }}</span>
        <input v-model="form.level" class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary">
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.filters.techStack') }}</span>
        <input v-model="form.techStack" class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary" :placeholder="$t('home.form.techStackPlaceholder')">
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

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.table.matchScore') }}</span>
        <input v-model="form.matchScore" inputmode="numeric" class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary">
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.form.appliedAt') }}</span>
        <input v-model="form.appliedAt" class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary" type="date">
      </label>

      <label class="space-y-1 text-sm">
        <span class="font-medium">{{ $t('home.table.nextAction') }}</span>
        <input v-model="form.nextActionAt" class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary" type="datetime-local">
      </label>

      <label class="space-y-1 text-sm md:col-span-2 xl:col-span-4">
        <span class="font-medium">{{ $t('home.details.notes') }}</span>
        <textarea v-model="form.notes" class="min-h-24 w-full rounded-md border border-default bg-default px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>

      <div class="flex flex-wrap items-center gap-3 md:col-span-2 xl:col-span-4">
        <UButton :loading="status === 'loading'" :disabled="status === 'loading'" type="submit">
          {{ $t('home.form.save') }}
        </UButton>
        <UButton :disabled="status === 'loading'" color="neutral" type="button" variant="soft" @click="resetToBlank">
          {{ $t('home.form.new') }}
        </UButton>
        <p v-if="status === 'loading'" class="text-sm text-muted">
          {{ $t('home.form.loading') }}
        </p>
        <p v-if="status === 'success'" class="text-sm text-success">
          {{ $t('home.form.success') }}
        </p>
        <p v-if="status === 'error'" class="text-sm text-error">
          {{ $t('home.form.error') }}
        </p>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { vacancyPriorityIds, vacancyStatusIds, workFormatIds } from '../../domain/vacancies'
import type { Vacancy } from '../../schemas/vacancies.schema'

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

interface VacancyFormModel {
  appliedAt: string
  company: string
  createdAt: string
  currency: string
  format: string
  id: string
  level: string
  location: string
  matchScore: string
  nextActionAt: string
  notes: string
  priority: string
  role: string
  salaryMax: string
  salaryMin: string
  source: string
  status: string
  techStack: string
  updatedAt: string
}

const props = defineProps<{
  status: FormStatus
  vacancy: Vacancy | undefined
}>()

const emit = defineEmits<{
  resetStatus: []
  save: [payload: VacancyFormModel]
}>()

const form = ref(createFormModel(props.vacancy))

watch(() => props.vacancy, (vacancy) => {
  form.value = createFormModel(vacancy)
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

function createFormModel(vacancy: Vacancy | undefined): VacancyFormModel {
  const timestamp = createTimestamp()

  return {
    appliedAt: vacancy?.appliedAt ?? '',
    company: vacancy?.company ?? '',
    createdAt: vacancy?.createdAt ?? timestamp,
    currency: vacancy?.currency ?? '',
    format: vacancy?.format ?? 'remote',
    id: vacancy?.id ?? `vacancy-${timestamp.slice(0, 10)}`,
    level: vacancy?.level ?? '',
    location: vacancy?.location ?? '',
    matchScore: vacancy?.matchScore?.toString() ?? '',
    nextActionAt: toDatetimeLocal(vacancy?.nextActionAt),
    notes: vacancy?.notes ?? '',
    priority: vacancy?.priority ?? 'medium',
    role: vacancy?.role ?? '',
    salaryMax: vacancy?.salaryMax?.toString() ?? '',
    salaryMin: vacancy?.salaryMin?.toString() ?? '',
    source: vacancy?.source ?? '',
    status: vacancy?.status ?? 'wishlist',
    techStack: vacancy?.techStack.join(', ') ?? '',
    updatedAt: timestamp,
  }
}

function submitForm() {
  emit('resetStatus')
  emit('save', {
    ...form.value,
    nextActionAt: fromDatetimeLocal(form.value.nextActionAt),
    updatedAt: createTimestamp(),
  })
}

function resetToBlank() {
  emit('resetStatus')
  form.value = createFormModel(undefined)
}
</script>
