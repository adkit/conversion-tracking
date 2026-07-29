import type { GoogleTrackingConfig, GoogleTrackingInterface, ConversionParams } from './types';

export type { GoogleTrackingConfig, GoogleTrackingInterface, GoogleTrackingLoadMode, ConversionParams } from './types';

const LAZY_LOAD_TIMEOUT_MS = 2_000;

/**
 * Logger utility for styled console output
 */
const logger = {
    info: (message: string, data?: any) => {
        if (data !== undefined) {
            console.log(`%c[Google Tracking]%c ${message}`, 'background: #4285f4; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;', 'color: inherit;', data);
        } else {
            console.log(`%c[Google Tracking]%c ${message}`, 'background: #4285f4; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;', 'color: inherit;');
        }
    },
    warn: (message: string, data?: any) => {
        if (data !== undefined) {
            console.warn(`%c[Google Tracking]%c ${message}`, 'background: #ff9800; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;', 'color: inherit;', data);
        } else {
            console.warn(`%c[Google Tracking]%c ${message}`, 'background: #ff9800; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;', 'color: inherit;');
        }
    },
    success: (message: string, data?: any) => {
        if (data !== undefined) {
            console.log(`%c[Google Tracking]%c ${message}`, 'background: #4caf50; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;', 'color: inherit;', data);
        } else {
            console.log(`%c[Google Tracking]%c ${message}`, 'background: #4caf50; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;', 'color: inherit;');
        }
    },
    error: (message: string, data?: any) => {
        if (data !== undefined) {
            console.error(`%c[Google Tracking]%c ${message}`, 'background: #f44336; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;', 'color: inherit;', data);
        } else {
            console.error(`%c[Google Tracking]%c ${message}`, 'background: #f44336; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;', 'color: inherit;');
        }
    },
};

/**
 * Google Tracking class implementation
 */
class GoogleTracking implements GoogleTrackingInterface {
    private initialized = false;
    private config: GoogleTrackingConfig | null = null;
    private tagIds: string[] = [];
    private scriptRequested = false;

    /**
     * Initialize Google Tracking with configuration
     */
    init(config: GoogleTrackingConfig): void {
        if (this.initialized) {
            logger.warn('Already initialized');
            return;
        }

        this.config = {
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
            if (this.config.debug) logger.info('Disabled on localhost (set enableLocalhost: true to enable)');
            return;
        }

        const tagIds = Array.isArray(config.tagId) ? config.tagId : [config.tagId];
        this.tagIds = tagIds.filter((id) => id);

        if (!this.tagIds.length) {
            logger.warn('No tag ID provided');
            return;
        }

        if (this.config.debug) logger.info('Initializing Google Tracking...', { tagIds: this.tagIds });

        this.installQueue();

        this.initialized = true;

        if (this.config.loadMode === 'eager') {
            this.load();
        } else if (this.config.loadMode === 'lazy') {
            this.scheduleLazyLoad();
        }

        if (this.config.debug) logger.success('Google Tracking initialized successfully');
    }

    /**
     * Request the external gtag.js script
     */
    load(): void {
        if (!this.initialized || this.scriptRequested || !this.tagIds.length) return;

        this.scriptRequested = true;

        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.tagIds[0]}`;
        script.addEventListener('error', () => {
            this.scriptRequested = false;
            script.remove();
            if (this.config?.debug) logger.error('Failed to load gtag.js');
        }, { once: true });

        try {
            document.head.appendChild(script);
        } catch (error) {
            this.scriptRequested = false;
            if (this.config?.debug) logger.error('Failed to load gtag.js', error);
        }
    }

    /**
     * Install Google's command queue before the external script is requested
     */
    private installQueue(): void {
        window.dataLayer = window.dataLayer || [];

        if (typeof window.gtag !== 'function') {
            window.gtag = function gtag() {
                window.dataLayer!.push(arguments);
            };
        }

        window.gtag('js', new Date());

        for (const tagId of this.tagIds) {
            window.gtag('config', tagId);
        }
    }

    /**
     * Wait for the host page to load, then use the next idle opportunity
     */
    private scheduleLazyLoad(): void {
        const loadWhenIdle = () => {
            if (typeof window.requestIdleCallback === 'function') {
                window.requestIdleCallback(() => this.load(), { timeout: LAZY_LOAD_TIMEOUT_MS });
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

    /**
     * Track a Google Ads conversion
     * @param conversionId - Full conversion ID (e.g., 'AW-17093683078/LpGGCJz1-5obEIbP89Y_')
     * @param params - Additional conversion parameters (value, currency, transaction_id)
     */
    trackConversion(conversionId: string, params: ConversionParams = {}): void {
        if (!this.isLoaded()) {
            if (this.config?.debug) logger.warn(`Conversion "${conversionId}" not tracked - Google Tracking not initialized`);
            return;
        }

        if (this.config?.debug) logger.info(`Tracking conversion: "${conversionId}"`, params);

        window.gtag!('event', 'conversion', {
            send_to: conversionId,
            ...params,
        });
    }

    /**
     * Check if the gtag command queue is installed
     */
    isLoaded(): boolean {
        return typeof window !== 'undefined' && typeof window.gtag === 'function';
    }

    /**
     * Get current configuration
     */
    getConfig(): GoogleTrackingConfig | null {
        return this.config;
    }
}

/**
 * Default Google Tracking instance (singleton)
 */
export const GOOGLE = new GoogleTracking();

/**
 * Create a new Google Tracking instance
 */
export function createGoogleTracking(): GoogleTrackingInterface {
    return new GoogleTracking();
}

/**
 * Default export
 */
export default GOOGLE;
