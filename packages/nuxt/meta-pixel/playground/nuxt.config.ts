export default defineNuxtConfig({
    modules: ['../src/module', '@nuxt/ui'],

    metaPixel: {
        pixelIds: '1234567890', // Dummy Pixel ID for testing
        autoTrackPageView: true,
        debug: true,
        enableLocalhost: true,
        excludedRoutes: ['/excluded/**'], // Exclude any route starting with /excluded
    },

    compatibilityDate: '2025-02-24',
    devtools: { enabled: true },
});
