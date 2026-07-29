<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Excluded Route (Config)</h2>
            <UBadge color="orange" size="lg"> Tracking Disabled </UBadge>
        </div>

        <UAlert icon="i-heroicons-exclamation-triangle" color="orange" variant="soft" title="No Tracking Expected" description="This route matches the 'excludedRoutes' pattern in nuxt.config.ts. No PageView event should be fired." />

        <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 class="font-medium mb-2">Verification</h3>
            <ol class="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Open browser console</li>
                <li>Clear console</li>
                <li>Refresh this page</li>
                <li>Verify NO <code>[Meta Pixel] Tracking standard event: "PageView"</code> log appears</li>
            </ol>
        </div>
    </div>
</template>
