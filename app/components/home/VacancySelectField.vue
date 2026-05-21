<template>
  <label class="space-y-1 text-sm">
    <span class="font-medium">{{ label }}</span>
    <USelectMenu
      v-model="model"
      :content="{ align: 'start' }"
      :items="items"
      :label-key="'label'"
      :placeholder="noVacancyLabel"
      :search-input="{ placeholder: searchPlaceholder }"
      :value-key="'id'"
      class="w-full"
    >
      <template #empty>
        {{ emptySearchMessage }}
      </template>
    </USelectMenu>
  </label>
</template>

<script setup lang="ts">
import type { Vacancy } from '../../schemas/vacancies.schema'

const props = defineProps<{
  vacancies: Vacancy[]
  label: string
  noVacancyLabel: string
  searchPlaceholder: string
  emptySearchMessage: string
}>()

const model = defineModel<string>({ default: '' })

const items = computed(() => [
  {
    id: '',
    label: props.noVacancyLabel,
  },
  ...props.vacancies.map((vacancy) => ({
    id: vacancy.id,
    label: `${vacancy.company} · ${vacancy.role}`,
  })),
])
</script>
