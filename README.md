# AdKit Ads Tracking

Open-source conversion tracking libraries for JavaScript and TypeScript. One typed, zero-dependency wrapper per ad platform: Google Ads (gtag.js) today, the Meta Pixel packages for React, Next.js, and Nuxt next, more platforms after that.

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

## Meta Pixel tracking

The Meta Pixel package family provides one core JavaScript client plus dedicated integrations for React, Next.js, and Nuxt. All four packages support eager, lazy, and manual vendor-script loading.

Start with the package matching your application:

- [`@adkit/meta-pixel`](./packages/js/meta-pixel): JavaScript and TypeScript
- [`@adkit/meta-pixel-react`](./packages/react/meta-pixel): React
- [`@adkit/meta-pixel-next`](./packages/next/meta-pixel): Next.js
- [`@adkit/meta-pixel-nuxt`](./packages/nuxt/meta-pixel): Nuxt

## FAQ

### Do these work with React, Next.js, Vue, and Nuxt?

Yes. The wrappers are framework-agnostic: initialize once in your entry point (or a client-only plugin in SSR frameworks) and call the tracking methods from anywhere. Each package README shows the exact setup per framework.

### Are conversions lost if the tracking script loads late?

No. The command queue is installed synchronously at `init()`, so conversion calls are buffered in order and flushed when the vendor script loads. If the script fails to load, the queue is kept and loading can be retried.

### Can I gate tracking behind cookie consent?

Yes. Use manual loading mode: `init()` prepares the queue, and you call `load()` only after the user accepts. If your consent policy requires that nothing runs before opt-in, call `init()` itself after consent.

### Do I need Google Tag Manager or a tag manager at all?

No. Each wrapper loads the platform's own script directly. If you already run a tag manager and fire conversions there, you don't need these packages.

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
