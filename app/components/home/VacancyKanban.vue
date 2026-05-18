<template>
  <section class="space-y-4" :aria-label="$t('home.kanban.title')">
    <div>
      <h2 class="text-xl font-semibold tracking-normal">
        {{ $t('home.kanban.title') }}
      </h2>
      <p class="text-sm text-muted">
        {{ $t('home.kanban.description') }}
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div v-for="status in statuses" :key="status" class="min-h-40 rounded-lg border border-default bg-muted/20">
        <div class="flex items-center justify-between gap-3 border-b border-default px-4 py-3">
          <h3 class="text-sm font-semibold">
            {{ $t(`domain.status.${status}`) }}
          </h3>
          <UBadge color="neutral" variant="soft">
            {{ groups[status].length }}
          </UBadge>
        </div>

        <div class="space-y-3 p-3">
          <article v-for="vacancy in groups[status]" :key="vacancy.id" class="rounded-md border border-default bg-default p-3">
            <div class="space-y-2">
              <div>
                <p class="text-sm font-medium">
                  {{ vacancy.company }}
                </p>
                <p class="text-xs text-muted">
                  {{ vacancy.role }}
                </p>
              </div>
              <div class="flex items-center justify-between gap-2 text-xs text-muted">
                <span>{{ $t(`domain.priority.${vacancy.priority}`) }}</span>
                <span>{{ formatDate(vacancy.nextActionAt) }}</span>
              </div>
            </div>
          </article>

          <p v-if="groups[status].length === 0" class="px-1 py-4 text-sm text-muted">
            {{ $t('home.kanban.empty') }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { parseISO } from 'date-fns'
import type { VacancyStatusId } from '../../domain/vacancies'
import type { Vacancy } from '../../schemas/vacancies.schema'

defineProps<{
  groups: Record<VacancyStatusId, Vacancy[]>
  statuses: VacancyStatusId[]
}>()

const { locale } = useI18n()
const dateFormatter = computed(() =>
  new Intl.DateTimeFormat(locale.value, {
    day: 'numeric',
    month: 'short',
  }),
)

function formatDate(value: string | undefined): string {
  if (value === undefined) {
    return '—'
  }

  const parsed = parseISO(value)
  return Number.isNaN(parsed.getTime()) ? '—' : dateFormatter.value.format(parsed)
}
</script>
