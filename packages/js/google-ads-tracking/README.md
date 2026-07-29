# Google Ads Conversion Tracking for JavaScript & TypeScript

Track Google Ads conversions from any JavaScript or TypeScript app. A zero-dependency gtag.js wrapper, 1.2 KB gzipped, with eager, lazy, and manual script loading. Conversions fired before gtag.js loads are queued, not lost.

[![npm version](https://img.shields.io/npm/v/@adkit/google-ads-tracking.svg)](https://www.npmjs.com/package/@adkit/google-ads-tracking)
[![npm downloads](https://img.shields.io/npm/dm/@adkit/google-ads-tracking.svg)](https://www.npmjs.com/package/@adkit/google-ads-tracking)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Works with React, Next.js, Vue, Nuxt, Svelte, and plain JavaScript. Written in TypeScript, ships its own type definitions.

## Install

```bash
npm install @adkit/google-ads-tracking
```

## Quick start

```typescript
import GOOGLE from '@adkit/google-ads-tracking';

// 1. Initialize once, in your app entry point
GOOGLE.init({ tagId: 'AW-XXXXXXXXXX' });

// 2. Track a conversion anywhere in your app
GOOGLE.trackConversion('AW-XXXXXXXXXX/CONVERSION_LABEL', {
    value: 29.99,
    currency: 'USD',
});
```

`init()` installs Google's command queue and loads gtag.js from googletagmanager.com. `trackConversion()` sends a conversion event to Google Ads with an optional value, currency, and transaction ID.

## Why not paste the gtag snippet?

Google's copy-paste snippet works, but it gives you a blocking script in `<head>`, no types, and no control over when gtag.js loads. This wrapper fixes the parts that hurt in a real app:

- **No lost conversions.** The command queue is installed synchronously during `init()`, in every loading mode. Conversions tracked before gtag.js arrives sit in the queue and are sent once it loads.
- **Control when the script loads.** Load gtag.js immediately, after the page is idle, or only when you decide. See [script loading modes](#script-loading-modes).
- **Typed API.** `GoogleTrackingConfig` and `ConversionParams` are exported, so wrong parameters fail at compile time instead of silently dropping data.
- **Safe defaults.** Tracking is off on localhost by default, and `init()` is a no-op during server-side rendering, so it won't crash SSR frameworks.
- **Debug mode.** Color-coded console logs show every init and conversion call during development.
- **Small.** 1.2 KB gzipped, zero dependencies.

## Script loading modes

`loadMode` controls when the external gtag.js script is requested. The command queue is installed immediately in all three modes, so `trackConversion()` works the same everywhere.

| Mode     | When gtag.js loads                                          | Use when                                             |
| -------- | ----------------------------------------------------------- | ---------------------------------------------------- |
| `eager`  | During `init()` (default)                                   | You want conversions reported as early as possible   |
| `lazy`   | After the page `load` event, at the next idle moment        | You're protecting Core Web Vitals / page speed       |
| `manual` | Only when you call `load()`                                 | You gate tracking behind cookie consent or a router  |

```typescript
GOOGLE.init({
    tagId: 'AW-XXXXXXXXXX',
    loadMode: 'manual',
});

// Queued in order, sent once gtag.js loads
GOOGLE.trackConversion('AW-XXXXXXXXXX/CONVERSION_LABEL');

// Safe to call more than once; the script is only requested once
GOOGLE.load();
```

In `lazy` mode the script waits for the page `load` event, then uses `requestIdleCallback` (with a 2 second timeout, falling back to `setTimeout` in browsers without idle callbacks). If the script fails to load, queued conversions are kept and `load()` can be called again.

## Configuration

| Option            | Type                            | Default   | Description                                                        |
| ----------------- | ------------------------------- | --------- | ------------------------------------------------------------------ |
| `tagId`           | `string \| string[]`            | required  | Google tag ID, or several (e.g. `'AW-XXXXXXXXXX'`)                 |
| `loadMode`        | `'eager' \| 'lazy' \| 'manual'` | `'eager'` | When to load the external gtag.js script                           |
| `debug`           | `boolean`                       | `false`   | Log every init and conversion call to the console                  |
| `enableLocalhost` | `boolean`                       | `false`   | Track on localhost (off by default so dev traffic stays out)       |

Multiple Google Ads accounts:

```typescript
GOOGLE.init({ tagId: ['AW-FIRST_TAG', 'AW-SECOND_TAG'] });
```

Every tag ID receives a `config` command. Conversions route by the `send_to` value you pass to `trackConversion()`.

## Tracking conversions

`trackConversion(conversionId, params?)` takes the full conversion ID (`AW-XXXXXXXXXX/CONVERSION_LABEL`, from your Google Ads conversion action) and optional parameters:

| Parameter        | Type     | Description                                        | Example          |
| ---------------- | -------- | -------------------------------------------------- | ---------------- |
| `value`          | `number` | Monetary value of the conversion                   | `99.99`          |
| `currency`       | `string` | ISO 4217 currency code                             | `'USD'`, `'EUR'` |
| `transaction_id` | `string` | Unique ID so Google deduplicates repeat conversions | `'ORDER_12345'`  |

Custom parameters pass through unchanged.

```typescript
// E-commerce purchase
GOOGLE.trackConversion('AW-XXXXX/purchase_label', {
    value: 149.99,
    currency: 'USD',
    transaction_id: 'order_abc123',
});

// Lead form submission (no value)
GOOGLE.trackConversion('AW-XXXXX/lead_label');

// Sign-up with a custom parameter
GOOGLE.trackConversion('AW-XXXXX/signup_label', {
    value: 10,
    currency: 'USD',
    new_customer: true,
});
```

## Usage with React and Next.js

Initialize once in your entry point, then call `trackConversion()` from event handlers.

**React (Vite / CRA)**, in `main.tsx`:

```typescript
import GOOGLE from '@adkit/google-ads-tracking';

GOOGLE.init({ tagId: 'AW-XXXXXXXXXX', loadMode: 'lazy' });
```

**Next.js (App Router)**, in a client component mounted from your root layout:

```typescript
'use client';
import { useEffect } from 'react';
import GOOGLE from '@adkit/google-ads-tracking';

export function GoogleAdsTracking() {
    useEffect(() => {
        GOOGLE.init({ tagId: 'AW-XXXXXXXXXX', loadMode: 'lazy' });
    }, []);
    return null;
}
```

`init()` checks for `window` and does nothing on the server, so importing it in SSR code is safe.

## Usage with Vue and Nuxt

**Vue**, in `main.ts`:

```typescript
import GOOGLE from '@adkit/google-ads-tracking';

GOOGLE.init({ tagId: 'AW-XXXXXXXXXX', loadMode: 'lazy' });
```

**Nuxt**, in a client-only plugin (`plugins/google-ads.client.ts`):

```typescript
import GOOGLE from '@adkit/google-ads-tracking';

export default defineNuxtPlugin(() => {
    GOOGLE.init({ tagId: 'AW-XXXXXXXXXX', loadMode: 'lazy' });
});
```

## API reference

| Method                               | Returns                        | What it does                                                          |
| ------------------------------------ | ------------------------------ | --------------------------------------------------------------------- |
| `init(config)`                       | `void`                         | Installs the gtag command queue, then loads gtag.js per `loadMode`    |
| `trackConversion(id, params?)`       | `void`                         | Sends a Google Ads conversion event                                   |
| `load()`                             | `void`                         | Requests gtag.js (for `manual` mode; safe to call repeatedly)         |
| `isLoaded()`                         | `boolean`                      | `true` once the gtag command queue is installed                       |
| `getConfig()`                        | `GoogleTrackingConfig \| null` | The active configuration                                              |

The default export `GOOGLE` is a shared singleton. For separate instances (e.g. different tags per app section), use the factory:

```typescript
import { createGoogleTracking } from '@adkit/google-ads-tracking';

const tracker = createGoogleTracking();
tracker.init({ tagId: 'AW-XXXXXXXXXX' });
```

## TypeScript

Type definitions are bundled, no `@types` package needed.

```typescript
import type { GoogleTrackingConfig, ConversionParams, GoogleTrackingLoadMode } from '@adkit/google-ads-tracking';
```

## Debug mode

Pass `debug: true` to `init()` to log every step with color-coded `[Google Tracking]` console messages: initialization, script loading, each conversion with its parameters, and warnings when a conversion is dropped.

```typescript
GOOGLE.init({
    tagId: 'AW-XXXXXXXXXX',
    debug: true,
    enableLocalhost: true, // also track during local development
});
```

## Migrating from @adkit.so/google-tracking

This package replaces [`@adkit.so/google-tracking`](https://www.npmjs.com/package/@adkit.so/google-tracking). The API is unchanged; `loadMode` is new.

```bash
npm uninstall @adkit.so/google-tracking
npm install @adkit/google-ads-tracking
```

Then update the import:

```diff
- import GOOGLE from '@adkit.so/google-tracking';
+ import GOOGLE from '@adkit/google-ads-tracking';
```

The old package keeps working but won't receive new features.

## FAQ

### Do I need Google Tag Manager?

No. This library loads gtag.js directly, which is Google's recommended path for Google Ads conversion tracking without a tag management layer. If you already run GTM and fire conversions there, you don't need this package.

### Can I track a conversion before gtag.js has loaded?

Yes. `init()` installs Google's command queue synchronously, so conversions are buffered in `window.dataLayer` in call order and sent when gtag.js processes the queue. This is what makes `lazy` and `manual` modes safe.

### Why aren't my conversions showing in Google Ads?

Common causes, in order:

1. Tracking is disabled on localhost by default. Set `enableLocalhost: true` to test locally.
2. Wrong ID format. `init()` takes the tag ID (`AW-XXXXXXXXXX`), `trackConversion()` takes tag ID plus label (`AW-XXXXXXXXXX/CONVERSION_LABEL`).
3. Google Ads reporting lags. Conversions can take up to 24 hours to appear.
4. Ad blockers block googletagmanager.com. Test in a clean profile.
5. The conversion action isn't set up or is inactive in Google Ads.

Turn on `debug: true` and check the console, then verify the tag with [Google Tag Assistant](https://tagassistant.google.com/).

### Does it work with server-side rendering?

Yes. `init()` returns early when `window` is undefined, so it's safe to import and call in Next.js, Nuxt, or any SSR framework. Tracking only runs in the browser.

### How do I wait for cookie consent?

Use `loadMode: 'manual'` and call `load()` after the user accepts. Conversions tracked in the meantime are queued locally. Note that queued commands live in `window.dataLayer`, so if your consent policy requires that nothing is prepared before opt-in, call `init()` itself after consent.

### Does it slow down my page?

gtag.js is always loaded `async`, and the wrapper itself is 1.2 KB gzipped. With `loadMode: 'lazy'` the script isn't even requested until after the page `load` event, keeping it out of your Core Web Vitals window.

## Google Ads documentation

- [Set up conversion tracking for your website](https://support.google.com/google-ads/answer/1722054)
- [The Google tag for Google Ads conversion tracking](https://support.google.com/google-ads/answer/7548399)
- [gtag.js API reference](https://developers.google.com/tag-platform/gtagjs/reference)
- [Google Tag Assistant](https://tagassistant.google.com/)

## Related packages

- [`@adkit.so/meta-pixel`](https://www.npmjs.com/package/@adkit.so/meta-pixel): Meta (Facebook) Pixel tracking with the same wrapper approach.

## License

[MIT](./LICENSE)

---

Built by [AdKit](https://adkit.so), the ad management platform for developers and small teams.
