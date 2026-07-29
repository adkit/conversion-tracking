<template>
    <div class="space-y-6">
        <h2 class="text-xl font-semibold">Manual Tracking Tests</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UCard>
                <template #header>
                    <div class="font-medium">Standard Events</div>
                </template>
                <div class="space-y-3">
                    <UButton block color="primary" @click="trackPurchase">Track Purchase ($99)</UButton>
                    <UButton block color="green" @click="trackAddToCart">Track AddToCart</UButton>
                    <UButton block color="blue" @click="trackLead">Track Lead</UButton>
                </div>
            </UCard>

            <UCard>
                <template #header>
                    <div class="font-medium">Custom Events</div>
                </template>
                <div class="space-y-3">
                    <UButton block color="orange" @click="trackCustom">Track Custom Event</UButton>
                    <UButton block color="purple" @click="trackWithMetadata">With Metadata</UButton>
                </div>
            </UCard>

            <UCard>
                <template #header>
                    <div class="font-medium">Status Log</div>
                </template>
                <div class="h-48 overflow-y-auto text-xs font-mono bg-gray-50 p-2 rounded border border-gray-200">
                    <div v-for="(log, i) in logs" :key="i" class="mb-1 border-b border-gray-100 pb-1">
                        <span class="text-gray-400">[{{ log.time }}]</span>
                        <span :class="log.color">{{ log.message }}</span>
                    </div>
                    <div v-if="logs.length === 0" class="text-gray-400 italic text-center mt-10">No events triggered yet</div>
                </div>
            </UCard>
        </div>
    </div>
</template>

<script setup>
    const meta = useMetaPixel();
    const logs = ref([]);

    const addLog = (message, type = 'info') => {
        const colors = {
            info: 'text-blue-600',
            success: 'text-green-600',
            warning: 'text-orange-600',
        };

        logs.value.unshift({
            time: new Date().toLocaleTimeString(),
            message,
            color: colors[type],
        });
    };

    const trackPurchase = () => {
        meta.track('Purchase', {
            value: 99.99,
            currency: 'USD',
            content_ids: ['SKU_123'],
            content_name: 'Premium Plan',
        });
        addLog('Tracked Purchase: $99.99', 'success');
    };

    const trackAddToCart = () => {
        meta.track('AddToCart', {
            value: 29.99,
            currency: 'USD',
            content_ids: ['SKU_456'],
        });
        addLog('Tracked AddToCart', 'info');
    };

    const trackLead = () => {
        meta.track('Lead', {
            content_name: 'Newsletter Signup',
        });
        addLog('Tracked Lead', 'info');
    };

    const trackCustom = () => {
        meta.trackCustom('ButtonCkicked', {
            button_id: 'custom_btn_1',
        });
        addLog('Tracked Custom Event', 'warning');
    };

    const trackWithMetadata = () => {
        meta.track('ViewContent', { content_name: 'Test Page' }, { eventID: 'dedup-123' });
        addLog('Tracked with EventID: dedup-123', 'info');
    };
</script>
