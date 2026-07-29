/**
 * Configuration options for Google Tracking
 */
export type GoogleTrackingLoadMode = 'eager' | 'lazy' | 'manual';

export interface GoogleTrackingConfig {
    /** Single Tag ID or array of Tag IDs (e.g., 'AW-17093683078' or ['AW-111', 'AW-222']) */
    tagId: string | string[];
    /** Choose when the external gtag.js script loads (defaults to eager) */
    loadMode?: GoogleTrackingLoadMode;
    /** Enable debug mode with styled console logging */
    debug?: boolean;
    /** Enable tracking on localhost (disabled by default) */
    enableLocalhost?: boolean;
}

/**
 * Conversion parameters for Google Ads conversion tracking
 */
export interface ConversionParams {
    /** Conversion value */
    value?: number;
    /** Currency code (e.g., 'USD') */
    currency?: string;
    /** Transaction ID for deduplication */
    transaction_id?: string;
    /** Allow custom parameters */
    [key: string]: string | number | boolean | undefined;
}

/**
 * Google Tracking interface
 */
export interface GoogleTrackingInterface {
    /** Initialize Google Tracking with configuration */
    init(config: GoogleTrackingConfig): void;
    /** Request the external gtag.js script (safe to call repeatedly) */
    load(): void;
    /** Track a Google Ads conversion */
    trackConversion(conversionId: string, params?: ConversionParams): void;
    /** Check if the gtag command queue is installed */
    isLoaded(): boolean;
    /** Get the current configuration */
    getConfig(): GoogleTrackingConfig | null;
}

/**
 * Window interface extension for gtag
 */
declare global {
    interface Window {
        dataLayer?: any[];
        gtag?: (...args: any[]) => void;
    }
}
