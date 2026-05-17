<template>
  <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div class="space-y-3">
      <UBadge color="primary" variant="soft">
        {{ $t('home.badge') }}
      </UBadge>
      <h1 class="max-w-3xl text-3xl font-bold tracking-normal sm:text-4xl">
        {{ $t('home.title') }}
      </h1>
      <p class="max-w-2xl text-base text-muted">
        {{ $t('home.description') }}
      </p>
    </div>

    <div class="text-sm text-muted">
      {{ $t('home.sync.loaded') }}
    </div>
  </div>
</template>
