<template>
  <div class="grid gap-3 min-[375px]:grid-cols-2 xl:grid-cols-4">
    <UCard v-for="metric in metrics" :key="metric.id">
      <div class="space-y-2">
        <p class="text-sm font-medium text-muted">
          {{ $t(`home.metrics.${metric.id}`) }}
        </p>
        <p class="text-3xl font-semibold tracking-normal">
          {{ formatMetric(metric) }}
        </p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { SummaryMetric } from '../../schemas/summary-metrics.schema'

defineProps<{
  metrics: SummaryMetric[]
}>()

const { locale } = useI18n()

function formatMetric(metric: SummaryMetric): string {
  if (metric.rate !== undefined) {
    return `${metric.rate}%`
  }

  return new Intl.NumberFormat(locale.value).format(metric.value)
}
</script>
