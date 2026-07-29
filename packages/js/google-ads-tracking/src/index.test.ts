import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createGoogleTracking } from './index';

describe('GoogleTracking', () => {
    let tracker: ReturnType<typeof createGoogleTracking>;
    let appendChildSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        // Create fresh instance for each test
        tracker = createGoogleTracking();

        // Reset window globals
        delete (window as any).gtag;
        delete (window as any).dataLayer;

        // Mock document.head.appendChild to prevent actual script loading
        appendChildSpy = vi.fn();
        vi.spyOn(document.head, 'appendChild').mockImplementation((node) => {
            appendChildSpy(node);
            return node;
        });

        // Mock console methods
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    describe('init()', () => {
        it('should initialize with valid config', () => {
            tracker.init({ tagId: 'AW-123456789', enableLocalhost: true });

            expect(tracker.isLoaded()).toBe(true);
            expect(tracker.getConfig()?.tagId).toBe('AW-123456789');
            expect(window.dataLayer).toBeDefined();
            expect(window.gtag).toBeDefined();
        });

        it('should load gtag script', () => {
            tracker.init({ tagId: 'AW-123456789', enableLocalhost: true });

            expect(appendChildSpy).toHaveBeenCalledTimes(1);
            const script = appendChildSpy.mock.calls[0][0] as HTMLScriptElement;
            expect(script.src).toContain('googletagmanager.com/gtag/js?id=AW-123456789');
            expect(script.async).toBe(true);
        });

        it('should configure gtag with tag ID', () => {
            tracker.init({ tagId: 'AW-123456789', enableLocalhost: true });

            // Check dataLayer contains config call
            const configCall = window.dataLayer?.find(
                (item: any) => item[0] === 'config' && item[1] === 'AW-123456789'
            );
            expect(configCall).toBeDefined();
        });

        it('should not initialize without tagId', () => {
            tracker.init({ tagId: '' });

            expect(tracker.isLoaded()).toBe(false);
            expect(appendChildSpy).not.toHaveBeenCalled();
        });

        it('should not initialize twice', () => {
            tracker.init({ tagId: 'AW-123456789', enableLocalhost: true });
            tracker.init({ tagId: 'AW-987654321', enableLocalhost: true });

            // Script should only be loaded once
            expect(appendChildSpy).toHaveBeenCalledTimes(1);
            // Config should remain as first initialization
            expect(tracker.getConfig()?.tagId).toBe('AW-123456789');
        });

        it('should skip on localhost when enableLocalhost is false', () => {
            // jsdom sets hostname to 'localhost' by default
            tracker.init({ tagId: 'AW-123456789', enableLocalhost: false });

            expect(tracker.isLoaded()).toBe(false);
            expect(appendChildSpy).not.toHaveBeenCalled();
        });

        it('should apply default config values', () => {
            tracker.init({ tagId: 'AW-123456789', enableLocalhost: true });

            const config = tracker.getConfig();
            expect(config?.debug).toBe(false);
            expect(config?.enableLocalhost).toBe(true);
            expect(config?.loadMode).toBe('eager');
        });

        it('should initialize with array of tag IDs', () => {
            tracker.init({ tagId: ['AW-111111111', 'AW-222222222'], enableLocalhost: true });

            expect(tracker.isLoaded()).toBe(true);
            expect(window.dataLayer).toBeDefined();

            // Check both tags are configured
            const configCalls = window.dataLayer?.filter(
                (item: any) => item[0] === 'config'
            );
            expect(configCalls?.length).toBe(2);
        });

        it('should load script with first tag ID when using array', () => {
            tracker.init({ tagId: ['AW-FIRST', 'AW-SECOND'], enableLocalhost: true });

            const script = appendChildSpy.mock.calls[0][0] as HTMLScriptElement;
            expect(script.src).toContain('id=AW-FIRST');
        });
    });

    describe('loading modes', () => {
        it('loads eagerly by default', () => {
            tracker.init({ tagId: 'AW-123456789', enableLocalhost: true });

            expect(appendChildSpy).toHaveBeenCalledTimes(1);
        });

        it('queues manual conversions in order and loads the script once', () => {
            tracker.init({
                tagId: 'AW-123456789',
                enableLocalhost: true,
                loadMode: 'manual',
            });

            tracker.trackConversion('AW-123456789/first');
            tracker.trackConversion('AW-123456789/second');

            expect(tracker.isLoaded()).toBe(true);
            expect(appendChildSpy).not.toHaveBeenCalled();

            const commands = window.dataLayer?.map((item) => Array.from(item));
            expect(commands?.map((item) => item[0])).toEqual(['js', 'config', 'event', 'event']);
            expect(commands?.map((item) => {
                const params = item[2] as { send_to?: string } | undefined;
                return params?.send_to;
            })).toEqual([
                undefined,
                undefined,
                'AW-123456789/first',
                'AW-123456789/second',
            ]);

            tracker.load();
            tracker.load();

            expect(appendChildSpy).toHaveBeenCalledTimes(1);
            expect(window.dataLayer).toHaveLength(4);
        });

        it.each(['eager', 'lazy', 'manual'] as const)(
            'queues multiple tags and a conversion exactly once in %s mode',
            (loadMode) => {
                if (loadMode === 'lazy') {
                    vi.stubGlobal('requestIdleCallback', vi.fn(() => 1));
                }

                tracker.init({
                    tagId: ['AW-FIRST', 'AW-SECOND'],
                    enableLocalhost: true,
                    loadMode,
                });
                tracker.trackConversion('AW-FIRST/signup', {
                    value: 49,
                    currency: 'EUR',
                    transaction_id: 'order-123',
                });

                const commandsBeforeLoad = window.dataLayer?.map((item) => Array.from(item));
                expect(commandsBeforeLoad).toEqual([
                    ['js', expect.any(Date)],
                    ['config', 'AW-FIRST'],
                    ['config', 'AW-SECOND'],
                    ['event', 'conversion', {
                        send_to: 'AW-FIRST/signup',
                        value: 49,
                        currency: 'EUR',
                        transaction_id: 'order-123',
                    }],
                ]);

                tracker.load();
                tracker.load();

                const commandsAfterLoad = window.dataLayer?.map((item) => Array.from(item));
                expect(commandsAfterLoad).toEqual(commandsBeforeLoad);
                expect(appendChildSpy).toHaveBeenCalledTimes(1);
            }
        );

        it.each(['eager', 'lazy', 'manual'] as const)(
            'logs initialization and conversion details in %s mode when debug is enabled',
            (loadMode) => {
                if (loadMode === 'lazy') {
                    vi.stubGlobal('requestIdleCallback', vi.fn(() => 1));
                }

                tracker.init({
                    tagId: 'AW-123456789',
                    debug: true,
                    enableLocalhost: true,
                    loadMode,
                });
                tracker.trackConversion('AW-123456789/signup', { value: 29 });

                const messages = vi.mocked(console.log).mock.calls.map(([message]) => message);
                expect(messages).toEqual([
                    '%c[Google Tracking]%c Initializing Google Tracking...',
                    '%c[Google Tracking]%c Google Tracking initialized successfully',
                    '%c[Google Tracking]%c Tracking conversion: "AW-123456789/signup"',
                ]);
            }
        );

        it.each(['eager', 'lazy', 'manual'] as const)(
            'makes no queue or vendor request in %s mode when localhost tracking is disabled',
            (loadMode) => {
                tracker.init({
                    tagId: 'AW-123456789',
                    enableLocalhost: false,
                    loadMode,
                });
                tracker.load();
                tracker.trackConversion('AW-123456789/rejected');

                expect(tracker.isLoaded()).toBe(false);
                expect(tracker.getConfig()?.loadMode).toBe(loadMode);
                expect(window.dataLayer).toBeUndefined();
                expect(appendChildSpy).not.toHaveBeenCalled();
            }
        );

        it('loads lazily after the host load event and an idle opportunity', () => {
            let runIdleCallback: (() => void) | undefined;
            const requestIdleCallback = vi.fn((callback: IdleRequestCallback) => {
                runIdleCallback = () => callback({
                    didTimeout: false,
                    timeRemaining: () => 50,
                });
                return 1;
            });
            vi.stubGlobal('requestIdleCallback', requestIdleCallback);
            vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');

            tracker.init({
                tagId: 'AW-123456789',
                enableLocalhost: true,
                loadMode: 'lazy',
            });

            expect(appendChildSpy).not.toHaveBeenCalled();

            window.dispatchEvent(new Event('load'));

            expect(requestIdleCallback).toHaveBeenCalledWith(
                expect.any(Function),
                { timeout: 2_000 }
            );
            expect(appendChildSpy).not.toHaveBeenCalled();

            runIdleCallback?.();

            expect(appendChildSpy).toHaveBeenCalledTimes(1);
        });

        it('uses a timer when the browser has no idle callback', () => {
            vi.useFakeTimers();
            vi.stubGlobal('requestIdleCallback', undefined);
            vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete');

            tracker.init({
                tagId: 'AW-123456789',
                enableLocalhost: true,
                loadMode: 'lazy',
            });

            expect(appendChildSpy).not.toHaveBeenCalled();

            vi.runOnlyPendingTimers();

            expect(appendChildSpy).toHaveBeenCalledTimes(1);
        });

        it.each(['eager', 'lazy', 'manual'] as const)(
            'keeps queued conversions and allows retry after script failure in %s mode',
            (loadMode) => {
                tracker.init({
                    tagId: 'AW-123456789',
                    enableLocalhost: true,
                    loadMode,
                });
                tracker.trackConversion('AW-123456789/before-failure');
                tracker.load();

                const failedScript = appendChildSpy.mock.calls[0][0] as HTMLScriptElement;
                failedScript.dispatchEvent(new Event('error'));

                tracker.trackConversion('AW-123456789/after-failure');
                tracker.load();

                const conversionCalls = window.dataLayer?.filter(
                    (item: any) => item[0] === 'event' && item[1] === 'conversion'
                );
                const commands = window.dataLayer?.map((item) => Array.from(item));
                expect(appendChildSpy).toHaveBeenCalledTimes(2);
                expect(conversionCalls?.map((item: any) => item[2].send_to)).toEqual([
                    'AW-123456789/before-failure',
                    'AW-123456789/after-failure',
                ]);
                expect(commands).toEqual([
                    ['js', expect.any(Date)],
                    ['config', 'AW-123456789'],
                    ['event', 'conversion', {
                        send_to: 'AW-123456789/before-failure',
                    }],
                    ['event', 'conversion', {
                        send_to: 'AW-123456789/after-failure',
                    }],
                ]);
            }
        );

        it('does not load manually after localhost initialization is rejected', () => {
            tracker.init({
                tagId: 'AW-123456789',
                enableLocalhost: false,
                loadMode: 'manual',
            });

            tracker.load();
            tracker.trackConversion('AW-123456789/rejected');

            expect(tracker.isLoaded()).toBe(false);
            expect(appendChildSpy).not.toHaveBeenCalled();
            expect(window.dataLayer).toBeUndefined();
        });
    });

    describe('trackConversion()', () => {
        it('should track conversion when loaded', () => {
            tracker.init({ tagId: 'AW-123456789', enableLocalhost: true });

            tracker.trackConversion('AW-123456789/abc123');

            // Find conversion event in dataLayer
            const conversionCall = window.dataLayer?.find(
                (item: any) => item[0] === 'event' && item[1] === 'conversion'
            );
            expect(conversionCall).toBeDefined();
        });

        it.each(['eager', 'lazy', 'manual'] as const)(
            'should preserve conversion params in %s mode',
            (loadMode) => {
                tracker.init({
                    tagId: 'AW-123456789',
                    enableLocalhost: true,
                    loadMode,
                });

                tracker.trackConversion('AW-123456789/abc123', {
                    value: 29.0,
                    currency: 'USD',
                    transaction_id: 'order-123',
                    new_customer: true,
                });

                // The gtag function pushes arguments object to dataLayer
                const lastCall = window.dataLayer?.[window.dataLayer.length - 1];
                expect(lastCall[0]).toBe('event');
                expect(lastCall[1]).toBe('conversion');
                expect(lastCall[2].send_to).toBe('AW-123456789/abc123');
                expect(lastCall[2].value).toBe(29.0);
                expect(lastCall[2].currency).toBe('USD');
                expect(lastCall[2].transaction_id).toBe('order-123');
                expect(lastCall[2].new_customer).toBe(true);
            }
        );

        it('should not track when not loaded', () => {
            // Don't initialize
            const initialLength = window.dataLayer?.length ?? 0;

            tracker.trackConversion('AW-123456789/abc123');

            // dataLayer should not have new entries
            expect(window.dataLayer?.length ?? 0).toBe(initialLength);
        });
    });

    describe('isLoaded()', () => {
        it('should return false before init', () => {
            expect(tracker.isLoaded()).toBe(false);
        });

        it('should return true after init with valid config', () => {
            tracker.init({ tagId: 'AW-123456789', enableLocalhost: true });
            expect(tracker.isLoaded()).toBe(true);
        });

        it('should return false when gtag is not a function', () => {
            (window as any).gtag = 'not a function';
            expect(tracker.isLoaded()).toBe(false);
        });
    });

    describe('getConfig()', () => {
        it('should return null before init', () => {
            expect(tracker.getConfig()).toBeNull();
        });

        it('should return config after init', () => {
            tracker.init({ tagId: 'AW-123456789', debug: true, enableLocalhost: true });

            const config = tracker.getConfig();
            expect(config).toEqual({
                tagId: 'AW-123456789',
                debug: true,
                enableLocalhost: true,
                loadMode: 'eager',
            });
        });
    });
});
