# Meta (Facebook) Pixel for Next.js

Add the Meta Pixel to your Next.js app with one component and get automatic PageView tracking on route changes. Type-safe events, `NEXT_PUBLIC_META_PIXEL_ID` support, App Router ready, and lazy script loading that keeps fbevents.js off your critical path.

[![npm version](https://img.shields.io/npm/v/@adkit/meta-pixel-next.svg)](https://www.npmjs.com/package/@adkit/meta-pixel-next)
[![npm downloads](https://img.shields.io/npm/dm/@adkit/meta-pixel-next.svg)](https://www.npmjs.com/package/@adkit/meta-pixel-next)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Built on [@adkit/meta-pixel-react](https://www.npmjs.com/package/@adkit/meta-pixel-react); the `<MetaPixel />` component handles initialization and route tracking for you.

## 📚 Table of Contents

-   [Features](#-features)
-   [Quick Start](#-quick-start)
-   [Configuration](#️-configuration)
-   [Manual Event Tracking](#-manual-event-tracking)
-   [Standard Events](#-standard-events)
-   [Advanced Usage](#-advanced-usage)
-   [TypeScript](#-typescript)
-   [Troubleshooting](#-troubleshooting)
-   [License](#-license)

## ✨ Features

-   ✅ **Auto PageView on Route Changes** - No manual tracking needed for navigation
-   🎯 **Simple Drop-in Component** - Just wrap your app with `<MetaPixel />`
-   🔧 **Environment Variable Support** - Use `NEXT_PUBLIC_META_PIXEL_ID` out of the box
-   📘 **TypeScript Support** - Full type definitions with autocomplete
-   🚀 **App Router Ready** - Works with Next.js 13+ App Router
-   🔌 **Multiple Pixels Support** - Track to multiple pixel IDs effortlessly

## ⚡ Quick Start

```bash
npm install @adkit/meta-pixel-next
```

Add `<MetaPixel />` to your root layout:

```tsx
// app/layout.tsx
import { MetaPixel } from '@adkit/meta-pixel-next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html>
            <body>
                <MetaPixel pixelId="YOUR_PIXEL_ID">{children}</MetaPixel>
            </body>
        </html>
    );
}
```

Track events in any component:

```tsx
'use client';

import { useMetaPixel } from '@adkit/meta-pixel-next';

export function PurchaseButton() {
    const meta = useMetaPixel();

    function handlePurchase() {
        meta.track('Purchase', { value: 99.99, currency: 'USD' });
    }

    return <button onClick={handlePurchase}>Buy Now</button>;
}
```

That's it! 🎉

## ⚙️ Configuration

### Component Props

| Prop                | Type                 | Default | Description                                                              |
| ------------------- | -------------------- | ------- | ------------------------------------------------------------------------ |
| `pixelId`           | `string \| string[]` | -       | Your Meta Pixel ID(s). Falls back to `NEXT_PUBLIC_META_PIXEL_ID` env var |
| `debug`             | `boolean`            | `false` | Enable styled console logging                                            |
| `enableLocalhost`   | `boolean`            | `false` | Enable tracking on localhost (for testing)                               |
| `trackPageViews`    | `boolean`            | `true`  | Auto track PageView on initial load and route changes                    |
| `loadMode`          | `'eager' \| 'lazy' \| 'manual'` | `'eager'` | Choose when to download Meta's vendor script                         |

`lazy` creates Meta's event queue immediately, then downloads the vendor script after the page load and an idle browser opportunity. `manual` creates the queue immediately and waits for `useMetaPixel().load()` to be called. Events sent before the download remain queued.

### Using Environment Variables

Instead of passing `pixelId` as a prop, use an environment variable:

```bash
# .env.local
NEXT_PUBLIC_META_PIXEL_ID=123456789012345
```

```tsx
// app/layout.tsx
import { MetaPixel } from '@adkit/meta-pixel-next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html>
            <body>
                <MetaPixel debug={true} enableLocalhost={true}>
                    {children}
                </MetaPixel>
            </body>
        </html>
    );
}
```

### Multiple Pixels

Track to multiple pixels simultaneously:

```tsx
<MetaPixel pixelId={['PIXEL_ID_1', 'PIXEL_ID_2', 'PIXEL_ID_3']}>{children}</MetaPixel>
```

## 💡 Manual Event Tracking

Use the `useMetaPixel` hook in any client component:

```tsx
'use client';

import { useMetaPixel } from '@adkit/meta-pixel-next';

export function ProductPage({ product }) {
    const meta = useMetaPixel();

    function handleAddToCart() {
        meta.track('AddToCart', {
            content_ids: [product.id],
            content_name: product.name,
            value: product.price,
            currency: 'USD',
        });
    }

    function handlePurchase() {
        meta.track('Purchase', {
            content_ids: [product.id],
            value: product.price,
            currency: 'USD',
            num_items: 1,
        });
    }

    return (
        <div>
            <h1>{product.name}</h1>
            <button onClick={handleAddToCart}>Add to Cart</button>
            <button onClick={handlePurchase}>Buy Now</button>
        </div>
    );
}
```

### Custom Events

Track custom events specific to your business:

```tsx
const meta = useMetaPixel();

function trackPricingView() {
    meta.trackCustom('PricingViewed', {
        plan: 'enterprise',
        source: 'homepage_cta',
    });
}

function trackVideoComplete() {
    meta.trackCustom('VideoWatched', {
        video_id: 'intro_2024',
        watch_percentage: 100,
    });
}
```

### Event Deduplication

Prevent duplicate events using `eventID`:

```tsx
function handleCheckout(orderId: string) {
    meta.track('Purchase', { value: 299.99, currency: 'USD' }, { eventID: `order-${orderId}` });
}
```

## 📊 Standard Events

All Meta Pixel standard events are supported with full TypeScript autocomplete:

| Event                  | Description                       | Common Use Cases   |
| ---------------------- | --------------------------------- | ------------------ |
| `PageView`             | **Auto-tracked** on route changes | -                  |
| `ViewContent`          | Content/product viewed            | Product pages      |
| `Search`               | Search performed                  | Site search        |
| `AddToCart`            | Item added to cart                | E-commerce         |
| `AddToWishlist`        | Item added to wishlist            | E-commerce         |
| `InitiateCheckout`     | Checkout started                  | Cart page          |
| `AddPaymentInfo`       | Payment info added                | Checkout flow      |
| `Purchase`             | Purchase completed                | Order confirmation |
| `Lead`                 | Lead form submitted               | Contact forms      |
| `CompleteRegistration` | Registration completed            | Sign-up flows      |
| `Contact`              | Contact action                    | Contact page       |
| `Schedule`             | Appointment scheduled             | Booking systems    |
| `StartTrial`           | Trial started                     | SaaS apps          |
| `Subscribe`            | Subscription started              | Newsletters        |

### Event Data Parameters

| Parameter          | Type       | Description            | Example           |
| ------------------ | ---------- | ---------------------- | ----------------- |
| `value`            | `number`   | Monetary value         | `99.99`           |
| `currency`         | `string`   | ISO 4217 currency code | `'USD'`, `'EUR'`  |
| `content_ids`      | `string[]` | Product IDs or SKUs    | `['SKU_123']`     |
| `content_type`     | `string`   | Type of content        | `'product'`       |
| `content_name`     | `string`   | Name of product/page   | `'Blue T-Shirt'`  |
| `content_category` | `string`   | Category               | `'Apparel'`       |
| `num_items`        | `number`   | Number of items        | `3`               |
| `search_string`    | `string`   | Search query           | `'running shoes'` |

## 🚀 Advanced Usage

### Complete E-commerce Example

```tsx
'use client';

import { useMetaPixel } from '@adkit/meta-pixel-next';
import { useEffect } from 'react';

export function ProductPage({ product }) {
    const meta = useMetaPixel();

    useEffect(() => {
        // Track product view on page load
        meta.track('ViewContent', {
            content_ids: [product.id],
            content_type: 'product',
            content_name: product.name,
            content_category: product.category,
            value: product.price,
            currency: 'USD',
        });
    }, [product.id]);

    function handleAddToCart() {
        meta.track('AddToCart', {
            content_ids: [product.id],
            content_type: 'product',
            content_name: product.name,
            value: product.price,
            currency: 'USD',
        });
    }

    function handlePurchase(orderId: string) {
        meta.track(
            'Purchase',
            {
                content_ids: [product.id],
                content_type: 'product',
                value: product.price,
                currency: 'USD',
                num_items: 1,
            },
            { eventID: orderId }, // For deduplication
        );
    }

    return (
        <div>
            <h1>{product.name}</h1>
            <p>${product.price}</p>
            <button onClick={handleAddToCart}>Add to Cart</button>
            <button onClick={() => handlePurchase('order-123')}>Buy Now</button>
        </div>
    );
}
```

### Disable Auto PageView Tracking

If you prefer to handle PageView tracking manually:

```tsx
<MetaPixel pixelId="YOUR_PIXEL_ID" autoTrackPageView={false}>
    {children}
</MetaPixel>
```

### Check if Pixel is Loaded

```tsx
function trackIfReady() {
    if (meta.isLoaded()) {
        meta.track('Purchase', { value: 99.99, currency: 'USD' });
    }
}
```

## 📘 TypeScript

Full TypeScript support with exported types:

```tsx
import type { StandardEvent, EventData, EventMetaData } from '@adkit/meta-pixel-next';

function trackEvent(event: StandardEvent, data: EventData) {
    meta.track(event, data);
}
```

## 🐛 Debug Mode

Enable `debug={true}` to see styled console logs:

```
[Meta Pixel] Initializing Meta Pixel... { pixelIds: [...] }
[Meta Pixel] ✓ Meta Pixel initialized successfully
[Meta Pixel] Tracking: PageView
[Meta Pixel Next.js] Auto-tracking PageView on route change: /about
```

## ❓ Troubleshooting

### Does the Facebook Pixel slow down my Next.js app?

fbevents.js is loaded `async`, so it doesn't block HTML parsing. To keep the download out of your Core Web Vitals window entirely, pass `loadMode="lazy"` to `<MetaPixel />`: the event queue is created immediately, but the script only downloads after the page `load` event, at the browser's next idle moment. Events fired in the meantime are queued and sent once the script arrives.

### Pixel not loading?

1. **Check your pixel ID** - Verify it's correct
2. **Enable debug mode** - Set `debug={true}` to see logs
3. **Enable localhost** - Set `enableLocalhost={true}` for local testing
4. **Check browser console** - Look for errors

### PageView not tracking on route changes?

Make sure `<MetaPixel />` wraps your content in the root layout, not a nested layout.

### Events not showing in Meta Events Manager?

-   **Wait 5-20 minutes** - Events can take time to appear
-   **Use Test Events tool** - In Meta Events Manager
-   **Check ad blockers** - They can block the pixel

### Using React without Next.js?

Use [@adkit/meta-pixel-react](https://www.npmjs.com/package/@adkit/meta-pixel-react) instead. Note: auto PageView on route changes requires manual setup with React Router.

## 📖 Full Guide

For a complete step-by-step guide on installing and configuring Meta Pixel, check out our detailed tutorial:

**[How to Install Meta Pixel](https://adkit.so/resources/how-to-install-meta-pixel)**

## 📚 Official Documentation

-   **[Meta Pixel Reference](https://developers.facebook.com/docs/meta-pixel/reference/)** - Complete API reference
-   **[Standard Events Guide](https://developers.facebook.com/docs/meta-pixel/implementation/conversion-tracking#standard-events)** - Event documentation
-   **[Events Manager](https://www.facebook.com/events_manager2)** - Monitor your pixel events

## 📄 License

MIT

---

**Made with ❤️ by [Adkit](https://adkit.so)**

If this package helped you, please consider giving it a ⭐️ on [GitHub](https://github.com/adkit/conversion-tracking)!
