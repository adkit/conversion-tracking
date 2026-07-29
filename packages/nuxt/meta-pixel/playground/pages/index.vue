<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Status Dashboard</h2>
            <UBadge :color="isLoaded ? 'green' : 'red'" size="lg">
                {{ isLoaded ? 'Pixel Loaded' : 'Pixel Not Loaded' }}
            </UBadge>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UCard>
                <template #header>
                    <h3 class="font-medium">Configuration</h3>
                </template>
                <dl class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <dt class="text-gray-500">Pixel ID:</dt>
                        <dd class="font-mono">1234567890</dd>
                    </div>
                    <div class="flex justify-between">
                        <dt class="text-gray-500">Auto Track PageView:</dt>
                        <dd class="text-green-500">Enabled</dd>
                    </div>
                    <div class="flex justify-between">
                        <dt class="text-gray-500">Debug Mode:</dt>
                        <dd class="text-green-500">Enabled</dd>
                    </div>
                    <div class="flex justify-between">
                        <dt class="text-gray-500">Localhost:</dt>
                        <dd class="text-green-500">Enabled</dd>
                    </div>
                </dl>
            </UCard>

            <UCard>
                <template #header>
                    <h3 class="font-medium">Current Route Status</h3>
                </template>
                <div class="space-y-4">
                    <p>This route (<code>/</code>) <strong>should be tracked</strong>.</p>
                    <UAlert v-if="isLoaded" icon="i-heroicons-check-circle" color="green" variant="soft" title="Tracking Active" description="PageView event should have been fired automatically." />
                </div>
            </UCard>
        </div>
    </div>
</template>

<script setup>
    const meta = useMetaPixel();
    const isLoaded = ref(false);

    onMounted(() => {
        isLoaded.value = meta.isLoaded();
    });
</script>
