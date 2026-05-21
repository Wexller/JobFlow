<template>
  <label class="space-y-1 text-sm">
    <span class="font-medium">{{ label }}</span>
    <USelectMenu
      v-model="selectValue"
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

const allVacanciesValue = '__all_vacancies__'
const model = defineModel<string>({ default: '' })
const selectValue = computed({
  get: () => model.value || allVacanciesValue,
  set: (value: string) => {
    model.value = value === allVacanciesValue ? '' : value
  },
})

const items = computed(() => [
  {
    id: allVacanciesValue,
    label: props.noVacancyLabel,
  },
  ...props.vacancies.map((vacancy) => ({
    id: vacancy.id,
    label: `${vacancy.company} · ${vacancy.role}`,
  })),
])
</script>
