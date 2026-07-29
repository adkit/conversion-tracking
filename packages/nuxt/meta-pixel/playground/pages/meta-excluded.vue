<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Excluded Route (Page Meta)</h2>
            <UBadge color="orange" size="lg"> Tracking Disabled </UBadge>
        </div>

        <UAlert icon="i-heroicons-exclamation-triangle" color="orange" variant="soft" title="No Tracking Expected" description="This route has 'metaPixel: false' set in definePageMeta. No PageView event should be fired." />

        <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 class="font-medium mb-2">Code Reference</h3>
            <pre class="text-xs bg-gray-800 text-gray-200 p-2 rounded">
definePageMeta({
  metaPixel: false
})</pre
            >
        </div>
    </div>
</template>

<script setup>
    definePageMeta({
        metaPixel: false,
    });
</script>
