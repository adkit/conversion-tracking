import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { createMetaPixel } from '../dist/index.mjs';

const META_SCRIPT_URL = 'https://connect.facebook.net/en_US/fbevents.js';

let scripts;
let loadListener;
let idleCallback;
let timerCalls;

beforeEach(() => {
    scripts = [];
    loadListener = undefined;
    idleCallback = undefined;
    timerCalls = 0;

    globalThis.window = {
        location: { hostname: 'example.com' },
        addEventListener(event, callback) {
            if (event === 'load') loadListener = callback;
        },
        requestIdleCallback(callback) {
            idleCallback = callback;
            return 1;
        },
        setTimeout(callback) {
            timerCalls += 1;
            callback();
            return 1;
        },
    };

    globalThis.document = {
        readyState: 'complete',
        createElement() {
            let errorListener;
            const script = {
                async: false,
                src: '',
                fail: () => errorListener?.(),
                addEventListener(event, callback) {
                    if (event === 'error') errorListener = callback;
                },
                remove() {
                    scripts = scripts.filter((candidate) => candidate !== script);
                },
            };
            return script;
        },
        querySelector() {
            return scripts.find((script) => script.src === META_SCRIPT_URL) ?? null;
        },
        head: {
            appendChild(script) {
                scripts.push(script);
                return script;
            },
        },
    };
});

afterEach(() => {
    delete globalThis.window;
    delete globalThis.document;
});

describe('Meta Pixel loading modes', () => {
    it('keeps eager loading as the default and only requests the vendor once', () => {
        const pixel = createMetaPixel();

        pixel.init({ pixelIds: 'pixel-1', enableLocalhost: true });
        pixel.load();

        assert.equal(pixel.isLoaded(), true);
        assert.equal(pixel.isInitialized(), true);
        assert.equal(scripts.length, 1);
        assert.equal(scripts[0].async, true);
        assert.equal(scripts[0].src, META_SCRIPT_URL);
        assert.deepEqual(window.fbq.queue, [
            ['init', 'pixel-1'],
            ['track', 'PageView'],
        ]);
    });

    it('waits for host load and an idle opportunity in lazy mode', () => {
        Object.defineProperty(document, 'readyState', { configurable: true, value: 'loading' });
        const pixel = createMetaPixel();

        pixel.init({ pixelIds: 'pixel-1', enableLocalhost: true, loadMode: 'lazy' });

        assert.equal(pixel.isLoaded(), true);
        assert.equal(scripts.length, 0);
        assert.equal(typeof loadListener, 'function');

        loadListener();
        assert.equal(scripts.length, 0);
        assert.equal(typeof idleCallback, 'function');

        idleCallback();
        assert.equal(scripts.length, 1);
    });

    it('falls back to a timer when requestIdleCallback is unavailable', () => {
        window.requestIdleCallback = undefined;
        const pixel = createMetaPixel();

        pixel.init({ pixelIds: 'pixel-1', enableLocalhost: true, loadMode: 'lazy' });

        assert.equal(timerCalls, 1);
        assert.equal(scripts.length, 1);
    });

    it('queues manual events with their fourth event metadata argument until load', () => {
        const pixel = createMetaPixel();

        pixel.init({ pixelIds: ['pixel-1', 'pixel-2'], enableLocalhost: true, loadMode: 'manual' });
        pixel.track('Purchase', { value: 99 }, { eventID: 'order-1' });
        pixel.trackCustom('QualifiedLead', { plan: 'pro' }, { eventID: 'lead-1' });

        assert.equal(scripts.length, 0);
        assert.equal(loadListener, undefined);
        assert.equal(idleCallback, undefined);
        assert.equal(timerCalls, 0);
        assert.deepEqual(window.fbq.queue, [
            ['init', 'pixel-1'],
            ['init', 'pixel-2'],
            ['track', 'PageView'],
            ['track', 'Purchase', { value: 99 }, { eventID: 'order-1' }],
            ['trackCustom', 'QualifiedLead', { plan: 'pro' }, { eventID: 'lead-1' }],
        ]);

        pixel.load();
        pixel.load();

        assert.equal(scripts.length, 1);
        assert.equal(window.fbq.queue.length, 5);
    });

    it('can disable the automatic initial PageView', () => {
        const pixel = createMetaPixel();

        pixel.init({
            pixelIds: 'pixel-1',
            autoTrackPageView: false,
            enableLocalhost: true,
            loadMode: 'manual',
        });

        assert.deepEqual(window.fbq.queue, [
            ['init', 'pixel-1'],
        ]);
    });

    it('does not initialize without a usable pixel ID', () => {
        const pixel = createMetaPixel();

        pixel.init({ pixelIds: ['', ''], enableLocalhost: true });

        assert.equal(pixel.isLoaded(), false);
        assert.equal(pixel.isInitialized(), false);
        assert.equal(scripts.length, 0);
    });

    it('initializes its configured pixel when another integration already installed fbq', () => {
        const calls = [];
        window.fbq = (...args) => calls.push(args);
        const pixel = createMetaPixel();

        pixel.init({
            pixelIds: 'pixel-1',
            enableLocalhost: true,
            loadMode: 'manual',
        });

        assert.equal(pixel.isLoaded(), true);
        assert.equal(pixel.isInitialized(), true);
        assert.deepEqual(calls, [
            ['init', 'pixel-1'],
            ['track', 'PageView'],
        ]);
        assert.equal(scripts.length, 0);
    });

    it('does not request the vendor before initialization', () => {
        const pixel = createMetaPixel();

        pixel.load();

        assert.equal(scripts.length, 0);
    });

    it('retries a manual load after the vendor script request fails', () => {
        const pixel = createMetaPixel();
        pixel.init({ pixelIds: 'pixel-1', enableLocalhost: true, loadMode: 'manual' });

        pixel.load();
        assert.equal(scripts.length, 1);

        scripts[0].fail();
        assert.equal(scripts.length, 0);

        pixel.load();
        assert.equal(scripts.length, 1);
    });

    it('ignores duplicate initialization', () => {
        const pixel = createMetaPixel();

        pixel.init({ pixelIds: 'pixel-1', enableLocalhost: true });
        pixel.init({ pixelIds: 'pixel-2', enableLocalhost: true });

        assert.equal(scripts.length, 1);
        assert.deepEqual(window.fbq.queue, [
            ['init', 'pixel-1'],
            ['track', 'PageView'],
        ]);
    });

    it('does not initialize on localhost unless explicitly enabled', () => {
        window.location.hostname = 'localhost';
        const pixel = createMetaPixel();

        pixel.init({ pixelIds: 'pixel-1' });

        assert.equal(pixel.isLoaded(), false);
        assert.equal(pixel.isInitialized(), false);
        assert.equal(scripts.length, 0);
    });

    it('calls the vendor method with the fbq receiver once it is available', () => {
        const pixel = createMetaPixel();
        pixel.init({ pixelIds: 'pixel-1', enableLocalhost: true, loadMode: 'manual' });
        const fbq = window.fbq;
        let receivedThis;
        let receivedArguments;
        fbq.callMethod = function (...args) {
            receivedThis = this;
            receivedArguments = args;
        };

        pixel.track('Lead', {}, { eventID: 'lead-1' });

        assert.equal(receivedThis, fbq);
        assert.deepEqual(receivedArguments, ['track', 'Lead', {}, { eventID: 'lead-1' }]);
    });
});
