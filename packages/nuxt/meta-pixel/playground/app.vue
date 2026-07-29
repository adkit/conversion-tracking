<template>
  <UContainer class="min-h-screen py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Meta Pixel Nuxt Module</h1>
      <p class="text-gray-500">Playground & Testing Suite</p>
    </div>

    <UCard class="mb-8">
      <template #header>
        <div class="flex items-center gap-4">
          <UButton to="/" variant="ghost" :color="$route.path === '/' ? 'primary' : 'gray'">
            Dashboard
          </UButton>
          <UButton to="/excluded" variant="ghost" :color="$route.path === '/excluded' ? 'primary' : 'gray'">
            Excluded (Config)
          </UButton>
          <UButton to="/meta-excluded" variant="ghost" :color="$route.path === '/meta-excluded' ? 'primary' : 'gray'">
            Excluded (Meta)
          </UButton>
          <UButton to="/manual" variant="ghost" :color="$route.path === '/manual' ? 'primary' : 'gray'">
            Manual Tracking
          </UButton>
        </div>
      </template>

      <NuxtPage />
    </UCard>

    <div class="text-center text-sm text-gray-400">
      Check the browser console to verify Meta Pixel events.
    </div>
  </UContainer>
</template>
