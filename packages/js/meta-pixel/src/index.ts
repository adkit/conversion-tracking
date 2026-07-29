import type { StandardEvent, EventData, EventMetaData, MetaPixelConfig, MetaPixelInterface, MetaPixelLoadMode } from './types';

export type { StandardEvent, EventData, EventMetaData, MetaPixelConfig, MetaPixelInterface, MetaPixelLoadMode } from './types';

/**
 * Logger utility for styled console output
 */
const logger = {
    info: (message: string, data?: any) => {
        if (data !== undefined) {
            console.log(`%c[Meta Pixel]%c ${message}`, 'background: #1877f2; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;', 'color: inherit;', data);
        } else {
            console.log(`%c[Meta Pixel]%c ${message}`, 'background: #1877f2; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;', 'color: inherit;');
        }
    },
    warn: (message: string, data?: any) => {
        if (data !== undefined) {
            console.warn(`%c[Meta Pixel]%c ${message}`, 'background: #ff9800; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;', 'color: inherit;', data);
        } else {
            console.warn(`%c[Meta Pixel]%c ${message}`, 'background: #ff9800; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;', 'color: inherit;');
        }
    },
    success: (message: string, data?: any) => {
        if (data !== undefined) {
            console.log(`%c[Meta Pixel]%c ${message}`, 'background: #4caf50; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;', 'color: inherit;', data);
        } else {
            console.log(`%c[Meta Pixel]%c ${message}`, 'background: #4caf50; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;', 'color: inherit;');
        }
    },
    error: (message: string, data?: any) => {
        if (data !== undefined) {
            console.error(`%c[Meta Pixel]%c ${message}`, 'background: #f44336; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;', 'color: inherit;', data);
        } else {
            console.error(`%c[Meta Pixel]%c ${message}`, 'background: #f44336; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;', 'color: inherit;');
        }
    },
};

/**
 * List of standard Facebook Pixel events
 */
const STANDARD_EVENTS: StandardEvent[] = ['PageView', 'AddPaymentInfo', 'AddToCart', 'AddToWishlist', 'CompleteRegistration', 'Contact', 'CustomizeProduct', 'Donate', 'FindLocation', 'InitiateCheckout', 'Lead', 'Purchase', 'Schedule', 'Search', 'StartTrial', 'SubmitApplication', 'Subscribe', 'ViewContent'];
const META_PIXEL_SCRIPT_URL = 'https://connect.facebook.net/en_US/fbevents.js';

/**
 * Check if an event is a standard Facebook Pixel event
 */
function isStandardEvent(event: string): event is StandardEvent {
    return STANDARD_EVENTS.includes(event as StandardEvent);
}

/**
 * Meta Pixel class implementation
 */
class MetaPixel implements MetaPixelInterface {
    private initialized = false;
    private scriptRequested = false;
    private config: MetaPixelConfig | null = null;

    /**
     * Initialize Meta Pixel with configuration
     */
    init(config: MetaPixelConfig): void {
        if (this.initialized) {
            logger.warn('Already initialized');
            return;
        }

        this.config = {
            autoTrackPageView: true,
            debug: false,
            enableLocalhost: false,
            loadMode: 'eager',
            ...config,
        };

        // Check if we're in a browser environment
        if (typeof window === 'undefined') {
            if (this.config.debug) logger.warn('Not in browser environment, skipping initialization');
            return;
        }

        // Check if we're on localhost and should disable tracking
        if (!this.config.enableLocalhost && window.location.hostname === 'localhost') {
            if (this.config.debug) logger.info('Disabled on localhost (set enableLocalhost: true to enable for testing)');
            return;
        }

        // Normalize pixelIds to array
        const pixelIds = Array.isArray(config.pixelIds) ? config.pixelIds : [config.pixelIds];

        if (!pixelIds.length || pixelIds.every((id) => !id)) {
            logger.warn('No pixel IDs provided');
            return;
        }

        if (this.config.debug) logger.info('Initializing Meta Pixel...', { pixelIds, autoTrackPageView: this.config.autoTrackPageView });

        this.installQueue();

        for (const pixelId of pixelIds.filter((id) => id)) {
            window.fbq!('init', pixelId);
        }

        if (this.config.autoTrackPageView) {
            window.fbq!('track', 'PageView');
        }

        this.initialized = true;

        if (this.config.loadMode === 'eager') {
            this.load();
        } else if (this.config.loadMode === 'lazy') {
            this.scheduleLoad();
        }

        if (this.config.debug) logger.success('✓ Meta Pixel initialized successfully');
    }

    /**
     * Download the Meta vendor script
     */
    load(): void {
        if (!this.initialized || typeof document === 'undefined') return;
        if (this.scriptRequested) return;

        const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${META_PIXEL_SCRIPT_URL}"]`);
        if (existingScript) {
            this.scriptRequested = true;
            return;
        }

        this.scriptRequested = true;
        const script = document.createElement('script');
        script.async = true;
        script.src = META_PIXEL_SCRIPT_URL;
        script.addEventListener(
            'error',
            () => {
                this.scriptRequested = false;
                script.remove();
            },
            { once: true },
        );
        document.head.appendChild(script);
    }

    /**
     * Track a standard event (use trackCustom for custom events)
     */
    track(event: StandardEvent | string, data: EventData = {}, eventData: EventMetaData = {}): void {
        if (!this.isLoaded()) {
            logger.warn(`Event "${event}" not tracked - Pixel not loaded`);
            return;
        }

        if (isStandardEvent(event)) {
            if (this.config?.debug) logger.info(`Tracking standard event: "${event}"`, { data, eventData });
            window.fbq!('track', event, data, eventData);
        } else {
            // Warn user to use trackCustom for custom events
            logger.warn(`"${event}" is not a standard event. Use trackCustom() instead for custom events.`);
            if (this.config?.debug) logger.info(`Tracking custom event: "${event}"`, { data, eventData });
            window.fbq!('trackCustom', event, data, eventData);
        }
    }

    /**
     * Track a custom event
     */
    trackCustom(event: string, data: EventData = {}, eventData: EventMetaData = {}): void {
        if (!this.isLoaded()) {
            logger.warn(`Custom event "${event}" not tracked - Pixel not loaded`);
            return;
        }

        if (this.config?.debug) logger.info(`Tracking custom event: "${event}"`, { data, eventData });

        window.fbq!('trackCustom', event, data, eventData);
    }

    /**
     * Check if the Meta Pixel queue is ready
     */
    isLoaded(): boolean {
        return typeof window !== 'undefined' && typeof window.fbq === 'function';
    }

    /**
     * Check if this instance initialized its configured pixel IDs
     */
    isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Install Meta's queue without downloading the vendor script
     */
    private installQueue(): void {
        if (window.fbq) return;

        const fbq = function (...args: any[]) {
            if (fbq.callMethod) {
                fbq.callMethod.apply(fbq, args);
            } else {
                fbq.queue.push(args);
            }
        };

        fbq.queue = [] as any[][];
        fbq.callMethod = undefined as ((...args: any[]) => void) | undefined;
        Object.assign(fbq, {
            push: fbq,
            loaded: true,
            version: '2.0',
        });

        window.fbq = fbq;
        window._fbq = fbq;
    }

    /**
     * Wait for the page load and the next idle opportunity
     */
    private scheduleLoad(): void {
        const loadWhenIdle = () => {
            if (typeof window.requestIdleCallback === 'function') {
                window.requestIdleCallback(() => this.load(), { timeout: 2000 });
                return;
            }

            window.setTimeout(() => this.load(), 0);
        };

        if (document.readyState === 'complete') {
            loadWhenIdle();
            return;
        }

        window.addEventListener('load', loadWhenIdle, { once: true });
    }
}

/**
 * Default Meta Pixel instance
 */
export const META = new MetaPixel();

/**
 * Create a new Meta Pixel instance
 */
export function createMetaPixel(): MetaPixelInterface {
    return new MetaPixel();
}

/**
 * Default export
 */
export default META;
