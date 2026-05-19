<template>
  <div class="grid gap-3 rounded-lg border border-default p-3 sm:p-4 md:grid-cols-2 xl:grid-cols-4">
    <label class="space-y-1 text-sm">
      <span class="font-medium">{{ $t('home.filters.search') }}</span>
      <input
        v-model="model.query"
        class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary"
        :disabled="!isReady"
        :placeholder="$t('home.filters.searchPlaceholder')"
        type="search"
      >
    </label>

    <label class="space-y-1 text-sm">
      <span class="font-medium">{{ $t('home.filters.status') }}</span>
      <select
        v-model="model.status"
        :aria-label="$t('home.filters.statusAria')"
        class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary"
        :disabled="!isReady"
      >
        <option value="all">
          {{ $t('home.filters.all') }}
        </option>
        <option v-for="status in statusOptions" :key="status" :value="status">
          {{ $t(`domain.status.${status}`) }}
        </option>
      </select>
    </label>

    <label class="space-y-1 text-sm">
      <span class="font-medium">{{ $t('home.filters.priority') }}</span>
      <select v-model="model.priority" class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary" :disabled="!isReady">
        <option value="all">
          {{ $t('home.filters.all') }}
        </option>
        <option v-for="priority in priorityOptions" :key="priority" :value="priority">
          {{ $t(`domain.priority.${priority}`) }}
        </option>
      </select>
    </label>

    <label class="space-y-1 text-sm">
      <span class="font-medium">{{ $t('home.filters.format') }}</span>
      <select v-model="model.format" class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary" :disabled="!isReady">
        <option value="all">
          {{ $t('home.filters.all') }}
        </option>
        <option v-for="format in formatOptions" :key="format" :value="format">
          {{ $t(`domain.format.${format}`) }}
        </option>
      </select>
    </label>

    <label class="space-y-1 text-sm">
      <span class="font-medium">{{ $t('home.filters.source') }}</span>
      <select v-model="model.source" class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary" :disabled="!isReady">
        <option value="all">
          {{ $t('home.filters.all') }}
        </option>
        <option v-for="source in sourceOptions" :key="source" :value="source">
          {{ source }}
        </option>
      </select>
    </label>

    <label class="space-y-1 text-sm">
      <span class="font-medium">{{ $t('home.filters.level') }}</span>
      <select v-model="model.level" class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary" :disabled="!isReady">
        <option value="all">
          {{ $t('home.filters.all') }}
        </option>
        <option v-for="level in levelOptions" :key="level" :value="level">
          {{ level }}
        </option>
      </select>
    </label>

    <label class="space-y-1 text-sm">
      <span class="font-medium">{{ $t('home.filters.location') }}</span>
      <select v-model="model.location" class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary" :disabled="!isReady">
        <option value="all">
          {{ $t('home.filters.all') }}
        </option>
        <option v-for="location in locationOptions" :key="location" :value="location">
          {{ location }}
        </option>
      </select>
    </label>

    <label class="space-y-1 text-sm">
      <span class="font-medium">{{ $t('home.filters.techStack') }}</span>
      <select v-model="model.techStack" class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary" :disabled="!isReady">
        <option value="all">
          {{ $t('home.filters.all') }}
        </option>
        <option v-for="tech in techStackOptions" :key="tech" :value="tech">
          {{ tech }}
        </option>
      </select>
    </label>

    <label class="space-y-1 text-sm md:col-span-2 xl:col-span-3">
      <span class="font-medium">{{ $t('home.filters.sort') }}</span>
      <select v-model="sortModel" class="h-10 w-full rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-primary" :disabled="!isReady">
        <option value="applied_at:desc">
          {{ $t('home.sort.appliedDesc') }}
        </option>
        <option value="applied_at:asc">
          {{ $t('home.sort.appliedAsc') }}
        </option>
        <option value="priority:desc">
          {{ $t('home.sort.priorityDesc') }}
        </option>
        <option value="match_score:desc">
          {{ $t('home.sort.matchScoreDesc') }}
        </option>
        <option value="salary:desc">
          {{ $t('home.sort.salaryDesc') }}
        </option>
      </select>
    </label>

    <div class="flex items-end">
      <UButton block color="neutral" :disabled="!isReady" variant="soft" @click="$emit('reset')">
        {{ $t('home.filters.reset') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VacancyPriorityId, VacancyStatusId, WorkFormatId } from '../../domain/vacancies'

export interface VacancyFilterModel {
  format: WorkFormatId | 'all'
  level: string
  location: string
  priority: VacancyPriorityId | 'all'
  query: string
  source: string
  status: VacancyStatusId | 'all'
  techStack: string
}

defineEmits<{
  reset: []
}>()

defineProps<{
  formatOptions: WorkFormatId[]
  isReady: boolean
  levelOptions: string[]
  locationOptions: string[]
  priorityOptions: VacancyPriorityId[]
  sourceOptions: string[]
  statusOptions: VacancyStatusId[]
  techStackOptions: string[]
}>()

const model = defineModel<VacancyFilterModel>({ required: true })
const sortModel = defineModel<string>('sort', { required: true })
</script>
