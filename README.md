# AdKit Ads Tracking: Google Ads Conversion Tracking and Meta Pixel for JavaScript

Open-source conversion tracking libraries for JavaScript and TypeScript. One typed, zero-dependency wrapper per ad platform: Google Ads (gtag.js) and the Meta (Facebook) Pixel, with dedicated packages for React, Next.js, and Nuxt. More platforms will follow.

## Packages

| Package | Platform | Status |
| --- | --- | --- |
| [`@adkit/google-ads-tracking`](./packages/js/google-ads-tracking) | Google Ads conversion tracking with `gtag.js` | Maintained |
| [`@adkit/meta-pixel`](./packages/js/meta-pixel) | Framework-independent Meta Pixel client | Maintained |
| [`@adkit/meta-pixel-react`](./packages/react/meta-pixel) | Meta Pixel integration for React | Maintained |
| [`@adkit/meta-pixel-next`](./packages/next/meta-pixel) | Meta Pixel integration for Next.js | Maintained |
| [`@adkit/meta-pixel-nuxt`](./packages/nuxt/meta-pixel) | Meta Pixel module for Nuxt | Maintained |

Additional providers and framework integrations will be added when they are ready to ship.

## Why not paste the vendor snippet?

Every ad platform hands you a copy-paste tracking snippet, and every snippet has the same problems in a real app. You get a script tag in `<head>` with no types, no way to delay loading for page speed or cookie consent, and conversions silently dropped if you fire them before the vendor script arrives.

Each wrapper in this repo fixes that the same way:

- **No lost conversions.** The platform's command queue is installed synchronously at `init()`, so conversions fired before the vendor script loads are queued in order, not dropped. This is what makes deferred loading safe.
- **Control over script loading.** Load the vendor script eagerly, after the page is idle (protecting Core Web Vitals), or manually, for example after cookie consent.
- **Typed API.** Config and conversion parameters are TypeScript types, so mistakes fail at compile time instead of silently dropping data.
- **Safe defaults.** Tracking is off on localhost by default, and `init()` is a no-op during server-side rendering. Importing a wrapper in Next.js or Nuxt server code won't crash.

## How the wrappers avoid losing conversions

Google's and Meta's snippets both work the same way: a small inline queue (`dataLayer` for gtag.js, `fbq.queue` for the Pixel) collects tracking commands until the real script downloads and replays them. These wrappers install that queue synchronously during `init()`, in every loading mode.

Tracking calls made before the vendor script arrives sit in the queue in call order, and if the download fails, the queue is kept so loading can be retried. No conversion call is thrown away.

## Google Ads conversion tracking

[`@adkit/google-ads-tracking`](./packages/js/google-ads-tracking) tracks Google Ads conversions from any JavaScript or TypeScript app. It wraps `gtag.js` in 1.2 KB gzipped with eager, lazy, and manual script loading.

```bash
npm install @adkit/google-ads-tracking
```

```typescript
import GOOGLE from '@adkit/google-ads-tracking';

GOOGLE.init({ tagId: 'AW-XXXXXXXXXX' });
GOOGLE.trackConversion('AW-XXXXXXXXXX/CONVERSION_LABEL', { value: 29.99, currency: 'USD' });
```

Works with React, Next.js, Vue, Nuxt, and plain JavaScript. Full docs, loading modes, and framework examples are in the [package README](./packages/js/google-ads-tracking).

## Meta (Facebook) Pixel conversion tracking

The Meta Pixel family is one core JavaScript client plus dedicated integrations for React, Next.js, and Nuxt. All four packages ship typed standard and custom events, event deduplication for the Conversions API, and eager, lazy, and manual loading of `fbevents.js`.

Start with the package matching your application:

- [`@adkit/meta-pixel`](./packages/js/meta-pixel): JavaScript and TypeScript
- [`@adkit/meta-pixel-react`](./packages/react/meta-pixel): React
- [`@adkit/meta-pixel-next`](./packages/next/meta-pixel): Next.js
- [`@adkit/meta-pixel-nuxt`](./packages/nuxt/meta-pixel): Nuxt

```bash
npm install @adkit/meta-pixel-react
```

```tsx
import { MetaPixelProvider, useMetaPixel } from '@adkit/meta-pixel-react';

// Wrap your app once
<MetaPixelProvider pixelIds="YOUR_PIXEL_ID" loadMode="lazy">
    <App />
</MetaPixelProvider>;

// Track events anywhere
const meta = useMetaPixel();
meta.track('Purchase', { value: 99.99, currency: 'USD' });
```

For the setup on Meta's side (creating the pixel, finding your pixel ID), see [How to install the Meta Pixel](https://adkit.so/resources/how-to-install-meta-pixel).

## FAQ

### Do these work with React, Next.js, Vue, and Nuxt?

Yes. The wrappers are framework-agnostic: initialize once in your entry point (or a client-only plugin in SSR frameworks) and call the tracking methods from anywhere. Each package README shows the exact setup per framework.

### How do I track Google Ads conversions in React?

Install `@adkit/google-ads-tracking`, call `GOOGLE.init({ tagId: 'AW-...' })` once in your entry point, and call `GOOGLE.trackConversion()` from your event handlers. The [package README](./packages/js/google-ads-tracking) has snippets for React, Next.js, Vue, and Nuxt.

### How do I add the Facebook Pixel to Next.js?

Install `@adkit/meta-pixel-next` and drop `<MetaPixel pixelId="..." />` into your root layout. PageView is tracked automatically on route changes. Setup details are in the [package README](./packages/next/meta-pixel).

### Are conversions lost if the tracking script loads late?

No. The command queue is installed synchronously at `init()`, so conversion calls are buffered in order and flushed when the vendor script loads. If the script fails to load, the queue is kept and loading can be retried.

### Can I gate tracking behind cookie consent?

Yes. Use manual loading mode: `init()` prepares the queue, and you call `load()` only after the user accepts. If your consent policy requires that nothing runs before opt-in, call `init()` itself after consent.

### Do I need Google Tag Manager or a tag manager at all?

No. Each wrapper loads the platform's own script directly. If you already run a tag manager and fire conversions there, you don't need these packages.

### Do tracking scripts slow down my site?

The vendor scripts (`gtag.js`, `fbevents.js`) are always loaded `async`, so they don't block HTML parsing. With lazy mode they aren't even requested until after the page `load` event, at the browser's next idle moment, which keeps them out of your Core Web Vitals window. The wrappers themselves add about 1 KB gzipped.

## Why one repository?

Tracking libraries often share release and integration work. Keeping them together makes cross-package changes testable in one place while each package remains independently versioned and published.

The repository is organized first by framework or runtime, then by tracking provider:

```text
packages/
  js/
    google-ads-tracking/
    meta-pixel/
  react/
    meta-pixel/
  next/
    meta-pixel/
  nuxt/
    meta-pixel/
```

Only packages that are ready and maintained are added.

## Development

```bash
npm install
npm test
npm run build
```

Run a command for one package:

```bash
npm test --workspace @adkit/google-ads-tracking
npm run build --workspace @adkit/google-ads-tracking
npm test --workspace @adkit/meta-pixel
npm run build --workspace @adkit/meta-pixel
```

## Releases

Packages use independent versions. Changesets records the intended version change and release notes:

```bash
npm run changeset
```

Publishing is intentionally not automated until npm trusted publishing is configured for this repository.

## License

[MIT](./LICENSE)

---

Built by [AdKit](https://adkit.so), the ad management platform for developers and small teams.
