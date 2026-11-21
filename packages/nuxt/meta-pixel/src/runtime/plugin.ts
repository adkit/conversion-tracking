// @ts-expect-error - Internal module
import { defineNuxtPlugin, useRuntimeConfig, useRoute, useRouter } from '#app';
import META from '@adkit/meta-pixel';
import type { MetaPixelPublicRuntimeConfig } from '../module';

interface RouteMeta {
    metaPixel?: boolean;
}

interface NavigatedRoute {
    path: string;
    fullPath: string;
    meta: RouteMeta;
}

export default defineNuxtPlugin(() => {
    if (!import.meta.client) return;

    const config = useRuntimeConfig().public.metaPixel as MetaPixelPublicRuntimeConfig;
    const router = useRouter();
    const route = useRoute();

    if (!config?.pixelIds || config.pixelIds === '') {
        console.warn('[Meta Pixel] No pixel IDs provided in nuxt.config.ts');
        return;
    }

    /**
     * Convert glob-like pattern to regex pattern
     * Supports: /path/*, /path/**, and nested patterns
     */
    const globToRegex = (pattern: string): string => {
        // Escape special regex characters except * and /
        let regexPattern = pattern
            .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
            // Replace ** with a placeholder first
            .replace(/\*\*/g, '__DOUBLE_STAR__')
            // Replace single * with [^/]*
            .replace(/\*/g, '[^/]*')
            // Replace ** placeholder with .*
            .replace(/__DOUBLE_STAR__/g, '.*');

        // Handle trailing /.*  - make the slash optional so /dashboard/** matches both /dashboard and /dashboard/anything
        // This needs to be done before adding $ at the end
        const hasTrailingGlob = regexPattern.endsWith('/.*');
        if (hasTrailingGlob) {
            regexPattern = regexPattern.replace(/\/\.\*$/, '(?:/.*)?$');
        }

        // Add ^ at the start for exact matching from beginning
        if (!regexPattern.startsWith('^')) {
            regexPattern = '^' + regexPattern;
        }

        // Add $ at the end for exact matching (if not already added by trailing glob handling)
        if (!regexPattern.endsWith('$')) {
            regexPattern = regexPattern + '$';
        }

        return regexPattern;
    };

    /**
     * Test if a path matches a pattern (glob syntax)
     */
    const matchesPattern = (path: string, pattern: string): boolean => {
        try {
            const regexPattern = globToRegex(pattern);
            const regex = new RegExp(regexPattern);
            return regex.test(path);
        } catch (error) {
            if (config.debug) {
                console.error(`[Meta Pixel] Invalid route pattern: "${pattern}"`, error);
            }
            // On error, don't match (safer to not exclude/include on invalid pattern)
            return false;
        }
    };

    /**
     * Check if the current route should be tracked
     */
    const isAllowed = (path: string, meta: RouteMeta) => {
        // 1. Check page-level meta override
        if (meta.metaPixel === false) return false;
        if (meta.metaPixel === true) return true;

        // 2. Check included routes (whitelist)
        if (config.includedRoutes?.length) {
            return config.includedRoutes.some((pattern: string) => matchesPattern(path, pattern));
        }

        // 3. Check excluded routes (blacklist)
        if (config.excludedRoutes?.length) {
            const isExcluded = config.excludedRoutes.some((pattern: string) => matchesPattern(path, pattern));
            return !isExcluded;
        }

        return true;
    };

    /**
     * Initialize Meta Pixel
     */
    const init = () => {
        if (META.isInitialized()) return;

        META.init({
            pixelIds: config.pixelIds,
            autoTrackPageView: config.autoTrackPageView,
            debug: config.debug,
            enableLocalhost: config.enableLocalhost,
            loadMode: config.loadMode,
        });
    };

    // Handle initial load
    if (isAllowed(route.path, route.meta)) {
        init();
    }

    // Handle route changes (SPA navigation)
    router.afterEach((to: NavigatedRoute, from: NavigatedRoute, failure?: unknown) => {
        // Nuxt replays the initial route after plugins run, and init() already tracked that PageView
        const stayedOnSameUrl = to.fullPath === from.fullPath;
        if (failure || stayedOnSameUrl) return;

        if (isAllowed(to.path, to.meta)) {
            if (!META.isInitialized()) {
                // Initialize if this package has not configured its pixel IDs yet
                init();
            } else if (config.autoTrackPageView) {
                // Manually track PageView for subsequent navigations
                META.track('PageView');
            }
        }
    });
});
