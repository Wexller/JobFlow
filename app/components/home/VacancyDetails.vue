<template>
  <section v-if="details" class="space-y-4" :aria-label="$t('home.details.title')">
    <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <h2 class="text-xl font-semibold tracking-normal">
          {{ details.vacancy.company }}
        </h2>
        <p class="text-sm text-muted">
          {{ details.vacancy.role }}
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <UBadge color="primary" variant="soft">
          {{ $t(`domain.status.${details.vacancy.status}`) }}
        </UBadge>
        <UBadge color="neutral" variant="soft">
          {{ $t(`domain.priority.${details.vacancy.priority}`) }}
        </UBadge>
        <UBadge color="neutral" variant="soft">
          {{ $t(`domain.format.${details.vacancy.format}`) }}
        </UBadge>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <UCard>
        <template #header>
          <h3 class="text-base font-semibold">
            {{ $t('home.details.mainInfo') }}
          </h3>
        </template>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between gap-3">
            <dt class="text-muted">
              {{ $t('home.table.location') }}
            </dt>
            <dd>{{ details.vacancy.location ?? '—' }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-muted">
              {{ $t('home.table.salary') }}
            </dt>
            <dd>{{ formatMoneyRange(details.vacancy) }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-muted">
              {{ $t('home.table.nextAction') }}
            </dt>
            <dd>{{ formatDate(details.vacancy.nextActionAt) }}</dd>
          </div>
          <div>
            <dt class="text-muted">
              {{ $t('home.details.techStack') }}
            </dt>
            <dd class="mt-2 flex flex-wrap gap-2">
              <UBadge v-for="tech in details.vacancy.techStack" :key="tech" color="neutral" variant="soft">
                {{ tech }}
              </UBadge>
            </dd>
          </div>
        </dl>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-base font-semibold">
            {{ $t('home.details.timeline') }}
          </h3>
        </template>
        <ol class="space-y-3">
          <li v-for="event in details.pipelineEvents" :key="event.id" class="rounded-md border border-default p-3 text-sm">
            <p class="font-medium">
              {{ event.title ?? $t(`domain.stage.${event.stage}`) }}
            </p>
            <p class="text-muted">
              {{ $t(`domain.stage.${event.stage}`) }} · {{ $t(`domain.stageStatus.${event.status}`) }} · {{ formatDate(event.scheduledAt ?? event.occurredAt ?? event.completedAt) }}
            </p>
          </li>
        </ol>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-base font-semibold">
            {{ $t('home.details.interviews') }}
          </h3>
        </template>
        <div class="space-y-3">
          <article v-for="interview in details.interviews" :key="interview.id" class="rounded-md border border-default p-3 text-sm">
            <p class="font-medium">
              {{ $t(`domain.stage.${interview.stage}`) }}
            </p>
            <p class="text-muted">
              {{ formatDate(interview.scheduledAt) }} · {{ $t(`domain.interviewResult.${interview.result}`) }}
            </p>
            <p v-if="interview.interviewerNames.length > 0" class="mt-2 text-muted">
              {{ interview.interviewerNames.join(', ') }}
            </p>
          </article>

          <p v-if="details.interviews.length === 0" class="text-sm text-muted">
            {{ $t('home.details.noInterviews') }}
          </p>
        </div>
      </UCard>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <UCard>
        <template #header>
          <h3 class="text-base font-semibold">
            {{ $t('home.details.offer') }}
          </h3>
        </template>
        <div v-if="details.offer" class="space-y-2 text-sm">
          <p>
            {{ $t(`domain.offerDecision.${details.offer.decision}`) }}
          </p>
          <p class="text-muted">
            {{ formatMoneyRange(details.offer) }}
          </p>
          <p class="text-muted">
            {{ $t('home.details.decisionDue') }}: {{ formatDate(details.offer.decisionDueAt) }}
          </p>
        </div>
        <p v-else class="text-sm text-muted">
          {{ $t('home.details.noOffer') }}
        </p>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-base font-semibold">
            {{ $t('home.details.notes') }}
          </h3>
        </template>
        <p class="text-sm text-muted">
          {{ details.vacancy.notes ?? $t('home.details.noNotes') }}
        </p>
      </UCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { parseISO } from 'date-fns'
import type { Offer } from '../../schemas/offers.schema'
import type { Vacancy } from '../../schemas/vacancies.schema'
import type { VacancyDetails } from '../../stores/jobflow'

defineProps<{
  details: VacancyDetails | undefined
}>()

const { locale } = useI18n()
const dateFormatter = computed(() =>
  new Intl.DateTimeFormat(locale.value, {
    day: 'numeric',
    month: 'short',
  }),
)
const moneyFormatter = computed(() =>
  new Intl.NumberFormat(locale.value, {
    maximumFractionDigits: 0,
  }),
)

function formatDate(value: string | undefined): string {
  return value === undefined ? '—' : dateFormatter.value.format(parseISO(value))
}

function formatMoneyRange(rangeValue: Pick<Vacancy | Offer, 'currency' | 'salaryMax' | 'salaryMin'>): string {
  if (rangeValue.salaryMin === undefined && rangeValue.salaryMax === undefined) {
    return '—'
  }

  const range = [rangeValue.salaryMin, rangeValue.salaryMax]
    .filter((value): value is number => value !== undefined)
    .map((value) => moneyFormatter.value.format(value))
    .join('–')

  return rangeValue.currency === undefined ? range : `${range} ${rangeValue.currency}`
}
</script>
