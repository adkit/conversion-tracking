/**
 * Standard Facebook Pixel events
 */
export type StandardEvent = 'PageView' | 'AddPaymentInfo' | 'AddToCart' | 'AddToWishlist' | 'CompleteRegistration' | 'Contact' | 'CustomizeProduct' | 'Donate' | 'FindLocation' | 'InitiateCheckout' | 'Lead' | 'Purchase' | 'Schedule' | 'Search' | 'StartTrial' | 'SubmitApplication' | 'Subscribe' | 'ViewContent';

/**
 * Controls when the Meta vendor script is downloaded
 */
export type MetaPixelLoadMode = 'eager' | 'lazy' | 'manual';

/**
 * Event data for Facebook Pixel events
 */
export interface EventData {
    /** Category of the page/product */
    content_category?: string;
    /** Product IDs associated with the event, such as SKUs (e.g., ['ABC123', 'XYZ789']) */
    content_ids?: Array<string | number>;
    /** Name of the page/product */
    content_name?: string;
    /** Either 'product' or 'product_group' based on the content_ids or contents being passed */
    content_type?: 'product' | 'product_group';
    /** An array of objects that contains the quantity and the product or content identifier(s) */
    contents?: Array<{ id: string | number; quantity: number }>;
    /** The currency for the value specified */
    currency?: string;
    /** Used with InitiateCheckout event. The number of items when checkout was initiated */
    num_items?: number;
    /** Predicted lifetime value of a subscriber as defined by the advertiser and expressed as an exact value */
    predicted_ltv?: number | string;
    /** Used with the Search event. The string entered by the user for the search */
    search_string?: string;
    /** Used with the CompleteRegistration event, to show the status of the registration */
    status?: boolean;
    /** The value of a user performing this event to the business */
    value?: number | string;
    /** Allow custom parameters */
    [key: string]: any;
}

/**
 * Additional event metadata for deduplication and advanced tracking
 */
export interface EventMetaData {
    /** Unique identifier for the event to support deduplication */
    eventID?: string;
    /** Allow additional metadata */
    [key: string]: any;
}

/**
 * Configuration options for initializing Meta Pixel
 */
export interface MetaPixelConfig {
    /** Single pixel ID or array of pixel IDs */
    pixelIds: string | string[];
    /** Whether to track PageView on initialization */
    autoTrackPageView?: boolean;
    /** Whether to enable debug mode */
    debug?: boolean;
    /** Whether to enable tracking on localhost (disabled by default) */
    enableLocalhost?: boolean;
    /** When to download the Meta vendor script (default: eager) */
    loadMode?: MetaPixelLoadMode;
}

/**
 * Meta Pixel interface
 */
export interface MetaPixelInterface {
    /** Initialize Meta Pixel with one or more pixel IDs */
    init(config: MetaPixelConfig): void;
    /** Download the Meta vendor script. Safe to call more than once. */
    load(): void;
    /** Track a standard or custom event */
    track(event: StandardEvent, data?: EventData, eventData?: EventMetaData): void;
    /** Track a custom event */
    trackCustom(event: string, data?: EventData, eventData?: EventMetaData): void;
    /** Check if the Meta Pixel queue is ready to accept events */
    isLoaded(): boolean;
    /** Check if this instance has initialized its configured pixel IDs */
    isInitialized(): boolean;
}

/**
 * Window interface extension for Facebook Pixel
 */
declare global {
    interface Window {
        fbq?: (...args: any[]) => void;
        _fbq?: any;
    }
}
