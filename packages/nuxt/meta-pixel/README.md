# Meta (Facebook) Pixel for Nuxt

Add the Meta Pixel to your Nuxt 3 or 4 app with one module and an auto-imported `useMetaPixel()` composable. Type-safe events, per-route tracking control, event deduplication for the Conversions API, and lazy script loading that keeps fbevents.js off your critical path.

[![npm version](https://img.shields.io/npm/v/@adkit/meta-pixel-nuxt.svg)](https://www.npmjs.com/package/@adkit/meta-pixel-nuxt)
[![npm downloads](https://img.shields.io/npm/dm/@adkit/meta-pixel-nuxt.svg)](https://www.npmjs.com/package/@adkit/meta-pixel-nuxt)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Built on [@adkit/meta-pixel](https://www.npmjs.com/package/@adkit/meta-pixel), the framework-independent core.

## 📚 Table of Contents

-   [Features](#-features)
-   [Quick Start](#-quick-start)
-   [Installation](#-installation)
-   [Configuration](#%EF%B8%8F-configuration)
-   [Usage](#-usage)
-   [Route Control](#-route-control)
-   [Standard Events](#-standard-events)
-   [Advanced Usage](#-advanced-usage)
-   [Troubleshooting](#-troubleshooting)
-   [Official Documentation](#-official-documentation)
-   [License](#-license)

## ✨ Features

-   ✅ **Typescript Support** - Full TypeScript support with autocomplete for all official events and parameters
-   🎨 **Auto-imported Composable** - `useMetaPixel()` available everywhere, zero boilerplate
-   🎯 **Custom Events Support** - Track custom events with full type safety and flexible data structures
-   🛣️ **Advanced Route Control** - Granular control on where to enable or disable tracking
-   🚦 **Event Deduplication** - Support for preventing duplicate events with event IDs
-   🔌 **Multiple Pixels Support** - Load and manage multiple pixel IDs effortlessly
-   ⏱️ **Flexible Loading** - Download Meta eagerly, lazily, or on a host-controlled schedule

## ⚡ Quick Start

```bash
npx nuxi@latest module add @adkit/meta-pixel-nuxt
```

OR

```bash
npm install @adkit/meta-pixel-nuxt
```

```typescript
export default defineNuxtConfig({
    modules: ['@adkit/meta-pixel-nuxt'],
    metaPixel: {
        pixelIds: 'YOUR_PIXEL_ID',
    },
});
```

```vue
<template>
    <button @click="handlePurchase">Complete Purchase</button>
</template>

<script setup>
    const meta = useMetaPixel();

    const handlePurchase = () => {
        meta.track('Purchase', {
            value: 99.99,
            currency: 'USD',
        });
    };
</script>
```

That's it! 🎉

## 📦 Installation

```bash
npx nuxi@latest module add @adkit/meta-pixel-nuxt
```

```bash
npm install @adkit/meta-pixel-nuxt
```

## ⚙️ Configuration

### Basic Setup

Add the module to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
    modules: ['@adkit/meta-pixel-nuxt'],

    metaPixel: {
        pixelIds: 'YOUR_PIXEL_ID', // or array ['PIXEL_1', 'PIXEL_2']
        autoTrackPageView: true, // default: true
        debug: true, // Enable debug logs (default: false)
        enableLocalhost: true, // Enable on localhost (default: false)
        loadMode: 'lazy', // 'eager' (default), 'lazy', or 'manual'
    },
});
```

### Configuration Options

| Option              | Type                 | Default | Description                                                             |
| ------------------- | -------------------- | ------- | ----------------------------------------------------------------------- |
| `pixelIds`          | `string \| string[]` | `''`    | **Required.** Single pixel ID or array of pixel IDs                     |
| `autoTrackPageView` | `boolean`            | `true`  | Automatically track PageView on initialization                          |
| `debug`             | `boolean`            | `false` | Enable styled console logs with background colors                       |
| `enableLocalhost`   | `boolean`            | `false` | Enable tracking on localhost (useful for testing)                       |
| `loadMode`          | `'eager' \| 'lazy' \| 'manual'` | `'eager'` | Choose when to download `fbevents.js`                                   |
| `excludedRoutes`    | `string[]`           | `[]`    | Array of glob patterns to exclude from tracking (e.g., `/dashboard/**`) |
| `includedRoutes`    | `string[]`           | `[]`    | Array of glob patterns to whitelist (only these routes will be tracked) |

### Loading Modes

-   `eager` downloads `fbevents.js` when the first allowed route initializes Meta. This remains the default.
-   `lazy` starts Meta's queue immediately, then downloads `fbevents.js` after the page has loaded and the browser has an idle opportunity.
-   `manual` starts the queue immediately but leaves the download to your application.

```typescript
export default defineNuxtConfig({
    modules: ['@adkit/meta-pixel-nuxt'],
    metaPixel: {
        pixelIds: 'YOUR_PIXEL_ID',
        loadMode: 'manual',
    },
});
```

```vue
<script setup>
const meta = useMetaPixel();

// Events queue until the host's vendor schedule starts Meta.
meta.track('Lead', {}, { eventID: 'lead-123' });
meta.load();
</script>
```

### Multiple Pixels Example

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
    metaPixel: {
        pixelIds: ['PIXEL_ID_1', 'PIXEL_ID_2', 'PIXEL_ID_3'],
        autoTrackPageView: true,
    },
});
```

## 💡 Usage

The `useMetaPixel()` composable is auto-imported and ready to use anywhere in your Nuxt app. It provides direct access to the Meta Pixel instance with all methods from `@adkit/meta-pixel`.

### Basic Usage

```vue
<!-- index.vue -->
<template>
    <button @click="meta.track('AddToCart', { value: 29.99, currency: 'USD' })">Add to Cart</button>
</template>

<script setup>
    const meta = useMetaPixel();

    // Track standard events
    meta.track('Purchase', {
        value: 99.99,
        currency: 'USD',
        content_ids: ['SKU_123'],
    });

    // Track custom events
    meta.trackCustom('MyCustomEvent', {
        custom_param: 'value',
    });
</script>
```

### With Event Deduplication

```vue
<!-- index.vue -->
<template>
    <button @click="handleCheckout">Checkout</button>
</template>

<script setup>
    const meta = useMetaPixel();

    const handleCheckout = () => {
        meta.track(
            'InitiateCheckout',
            {
                value: 149.99,
                currency: 'USD',
                num_items: 3,
            },
            {
                eventID: `checkout-${Date.now()}`,
            },
        );
    };
</script>
```

### Check if the Pixel Queue Is Ready

```vue
<!-- index.vue -->
<template>
    <button @click="trackIfReady">Track Purchase</button>
</template>

<script setup>
    const meta = useMetaPixel();

    const trackIfReady = () => {
        if (meta.isLoaded()) {
            meta.track('Purchase', { value: 99.99, currency: 'USD' });
        }
    };
</script>
```

In lazy and manual modes, `isLoaded()` reports that Meta's public queue is ready even before `fbevents.js` is downloaded.

## 🛣️ Route Control

You can control where the pixel is loaded using three methods:

### 1. Exclude Routes (Global)

In `nuxt.config.ts`, provide an array of glob patterns to exclude specific routes:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
    metaPixel: {
        pixelIds: '...',

        excludedRoutes: [
            '/dashboard/*', // Excludes /dashboard/inbox, /dashboard/settings (one level)
            '/dashboard/**', // Excludes /dashboard and ALL nested routes (any depth)
            '/admin/**', // Excludes /admin and all nested routes
            '/api/*', // Excludes /api/users, /api/posts (one level only)
        ],
    },
});
```

**Pattern Syntax:**

-   `*` - Matches any characters except `/` (single path segment)
-   `**` - Matches any characters including `/` (multiple path segments, any depth)

**Examples:**

-   `/dashboard/*` → Excludes `/dashboard/inbox` but NOT `/dashboard/inbox/messages`
-   `/dashboard/**` → Excludes `/dashboard`, `/dashboard/inbox`, `/dashboard/inbox/messages`, etc. (any depth)
-   `/api/*` → Excludes `/api/users` but NOT `/api/users/123`

### 2. Include Routes (Global)

If you only want to track specific sections, use `includedRoutes`. This takes precedence over excluded routes (except for page-level overrides).

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
    metaPixel: {
        pixelIds: '...',

        includedRoutes: [
            '/shop/**', // Track all shop pages (any depth)
            '/checkout/**', // Track all checkout pages (any depth)
            '/product/*', // Track product pages (one level only)
        ],
    },
});
```

### 3. Page-Level Control

You can enable or disable the pixel on a per-page basis using `definePageMeta`:

```vue
<template>
    <div>Secret page - no tracking here</div>
</template>

<script setup>
    definePageMeta({
        metaPixel: false,
    });
</script>
```

**Priority Order:**

1. Page-level `definePageMeta` (highest priority)
2. `includedRoutes` (if set, only these are tracked)
3. `excludedRoutes` (if set, these are ignored)
4. Default: Track everything

## 🌍 Environment Variables

You can configure pixel IDs via environment variables instead of hardcoding them in `nuxt.config.ts`. This is especially useful for different environments (dev, staging, production).

```bash
# .env
META_PIXEL_ID=123456789012345
```

Then reference it in your config:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
    metaPixel: {
        pixelIds: process.env.META_PIXEL_ID || '',
    },
});
```

### Multiple Pixels via Environment Variables

```bash
# .env
META_PIXEL_DEFAULT=123456789012345
META_PIXEL_BACKUP=987654321098765
```

```typescript
export default defineNuxtConfig({
    metaPixel: {
        pixelIds: [process.env.META_PIXEL_DEFAULT, process.env.META_PIXEL_BACKUP],
    },
});
```

## 🐛 Debug Mode

When `debug: true`, you'll see beautiful styled console logs:

-   🔵 **[Meta Pixel]** Info messages (blue background)
-   ✅ **[Meta Pixel]** Success messages (green background)
-   ⚠️ **[Meta Pixel]** Warning messages (orange background)

Example output:

```
[Meta Pixel] Initializing Meta Pixel... { pixelIds: [...], autoTrackPageView: true }
[Meta Pixel] ✓ Meta Pixel initialized successfully
[Meta Pixel] Tracking standard event: "Purchase" { data: {...}, eventData: {...} }
```

## 📊 Standard Events

All Meta Pixel standard events are supported with full TypeScript autocomplete. These events help you track important actions on your website and optimize your ad campaigns.

| Event                  | Description                   | Common Use Cases              |
| ---------------------- | ----------------------------- | ----------------------------- |
| `AddPaymentInfo`       | Payment info added            | Checkout flow                 |
| `AddToCart`            | Item added to shopping cart   | E-commerce                    |
| `AddToWishlist`        | Item added to wishlist        | E-commerce                    |
| `CompleteRegistration` | User completed registration   | Sign-ups, account creation    |
| `Contact`              | User contacted business       | Contact forms                 |
| `CustomizeProduct`     | Product customization started | Product configurators         |
| `Donate`               | Donation made                 | Non-profits                   |
| `FindLocation`         | Location finder used          | Store locators                |
| `InitiateCheckout`     | Checkout process started      | E-commerce funnels            |
| `Lead`                 | Lead submitted                | Lead generation forms         |
| `Purchase`             | Purchase completed            | Transaction confirmation      |
| `Schedule`             | Appointment scheduled         | Booking systems               |
| `Search`               | Search performed              | Site search                   |
| `StartTrial`           | Trial started                 | SaaS applications             |
| `SubmitApplication`    | Application submitted         | Job boards, loan applications |
| `Subscribe`            | Subscription started          | Newsletters, subscriptions    |
| `ViewContent`          | Content viewed                | Product pages, blog posts     |

You can find the official list of standard events [here](https://developers.facebook.com/docs/meta-pixel/reference/#standard-events).

### Example Usage

```vue
<template>
    <div>
        <button @click="trackPurchase">Complete Purchase</button>
        <button @click="trackLead">Submit Lead</button>
        <input @input="trackSearch($event.target.value)" placeholder="Search..." />
    </div>
</template>

<script setup>
    const meta = useMetaPixel();

    const trackPurchase = () => {
        meta.track('Purchase', {
            value: 299.99,
            currency: 'USD',
            content_ids: ['SKU_12345'],
            content_type: 'product',
            num_items: 1,
        });
    };

    const trackLead = () => {
        meta.track('Lead', {
            content_name: 'Newsletter Signup',
            content_category: 'Marketing',
        });
    };

    const trackSearch = (query: string) => {
        meta.track('Search', {
            search_string: query,
        });
    };
</script>
```

## 📋 Event Data Parameters

All event parameters are optional but help improve ad targeting and conversion tracking. Here are the most common ones:

| Parameter          | Type                    | Description                          | Example                          |
| ------------------ | ----------------------- | ------------------------------------ | -------------------------------- |
| `value`            | `number`                | Monetary value of the event          | `99.99`                          |
| `currency`         | `string`                | ISO 4217 currency code               | `'USD'`, `'EUR'`, `'GBP'`        |
| `content_ids`      | `string[]`              | Product IDs or SKUs                  | `['SKU_123', 'SKU_456']`         |
| `content_type`     | `string`                | Type of content                      | `'product'`, `'product_group'`   |
| `content_name`     | `string`                | Name of page/product                 | `'Blue T-Shirt'`                 |
| `content_category` | `string`                | Category of page/product             | `'Apparel'`, `'Electronics'`     |
| `contents`         | `Array<{id, quantity}>` | Detailed product information         | `[{id: 'SKU_123', quantity: 2}]` |
| `num_items`        | `number`                | Number of items                      | `3`                              |
| `search_string`    | `string`                | Search query                         | `'running shoes'`                |
| `status`           | `boolean`               | Registration/subscription status     | `true`                           |
| `predicted_ltv`    | `number`                | Predicted lifetime value of customer | `450.00`                         |

### Complete E-commerce Example

```vue
<template>
    <div>
        <h1>{{ product.name }}</h1>
        <p>${{ product.price }}</p>
        <button @click="trackAddToCart">Add to Cart</button>
        <button @click="trackPurchase('order-123')">Buy Now</button>
    </div>
</template>

<script setup>
    const meta = useMetaPixel();

    const product = {
        id: 'SKU_789',
        name: 'Wireless Headphones',
        price: 149.99,
        category: 'Electronics',
    };

    onMounted(() => {
        trackProductView();
    });

    const trackProductView = () => {
        meta.track('ViewContent', {
            content_ids: [product.id],
            content_type: 'product',
            content_name: product.name,
            content_category: product.category,
            value: product.price,
            currency: 'USD',
        });
    };

    const trackAddToCart = () => {
        meta.track('AddToCart', {
            content_ids: [product.id],
            content_type: 'product',
            content_name: product.name,
            value: product.price,
            currency: 'USD',
        });
    };

    const trackPurchase = (orderId: string) => {
        meta.track(
            'Purchase',
            {
                content_ids: [product.id],
                content_type: 'product',
                value: product.price,
                currency: 'USD',
                num_items: 1,
            },
            {
                eventID: orderId,
            },
        );
    };
</script>
```

## 🚀 Advanced Usage

### Custom Events

Track custom events specific to your business:

```vue
<template>
    <div>
        <button @click="trackPricingView">View Pricing</button>
        <video @ended="trackVideoComplete">Your video</video>
    </div>
</template>

<script setup>
    const meta = useMetaPixel();

    const trackPricingView = () => {
        meta.trackCustom('PricingPageViewed', {
            plan: 'enterprise',
            duration: 'annual',
        });
    };

    const trackVideoComplete = () => {
        meta.trackCustom('VideoWatched', {
            video_id: 'intro_2024',
            watch_percentage: 100,
        });
    };
</script>
```

### Event Deduplication

Prevent duplicate event tracking by using unique event IDs. This is crucial when tracking conversions from both client and server:

```vue
<script setup>
    const meta = useMetaPixel();

    const processOrder = async (orderId: string) => {
        // Use order ID as event ID to prevent duplicates
        meta.track(
            'Purchase',
            {
                value: 299.99,
                currency: 'USD',
                content_ids: ['SKU_123'],
            },
            {
                eventID: `order-${orderId}`,
            },
        );

        // Even if this fires multiple times or from server too,
        // Meta will deduplicate based on eventID
    };
</script>
```

### Conditional Tracking

```vue
<script setup>
    const meta = useMetaPixel();
    const userStore = useUserStore();

    const trackWithUserContext = () => {
        // Only track if pixel is loaded
        if (!meta.isLoaded()) {
            console.warn('Meta Pixel not loaded yet');
            return;
        }

        // Add user context to events
        meta.track('CompleteRegistration', {
            status: true,
            content_name: userStore.accountType,
        });
    };
</script>
```

## 📝 TypeScript Support

Full type safety with exported types:

```typescript
import type { StandardEvent, EventData, EventMetaData } from '@adkit/meta-pixel';

const meta = useMetaPixel();

const trackEvent = (event: StandardEvent, data: EventData) => {
    meta.track(event, data);
};
```

All methods, events, and parameters have complete TypeScript definitions with IntelliSense support in your IDE.

## ❓ Troubleshooting

### Does the Facebook Pixel slow down my Nuxt app?

fbevents.js is loaded `async`, so it doesn't block HTML parsing. To keep the download out of your Core Web Vitals window entirely, set `loadMode: 'lazy'` in the module options: the event queue is created immediately, but the script only downloads after the page `load` event, at the browser's next idle moment. Events fired in the meantime are queued and sent once the script arrives.

### Pixel not loading?

1. **Check your pixel ID** - Make sure it's correct in your config
2. **Enable debug mode** - Set `debug: true` to see detailed logs
3. **Check browser console** - Look for errors or warnings
4. **Verify route isn't excluded** - Check your `excludedRoutes` config
5. **Enable on localhost** - Set `enableLocalhost: true` for local testing

### Route exclusion not working?

If your routes aren't being excluded properly:

1. **Use glob patterns** - For most cases, glob patterns are easier:

    ```typescript
    excludedRoutes: ['/dashboard/**']; // ✅ Correct - excludes all dashboard routes
    ```

2. **Common mistakes to avoid**:

    ```typescript
    // ❌ Wrong - missing leading slash
    excludedRoutes: ['dashboard/**'];

    // ✅ Correct - with leading slash
    excludedRoutes: ['/dashboard/**'];
    ```

3. **Enable debug mode** to see which routes are being excluded:

    ```typescript
    metaPixel: {
        debug: true,  // Will log "Route excluded: /dashboard/inbox"
        excludedRoutes: ['/dashboard/**'],
    }
    ```

4. **Pattern examples**:
    - `/dashboard/*` - Excludes `/dashboard/inbox` but NOT `/dashboard/inbox/messages`
    - `/dashboard/**` - Excludes `/dashboard`, `/dashboard/inbox`, `/dashboard/inbox/messages`, etc. (any depth)

### Events not showing in Meta Events Manager?

-   **Wait a few minutes** - Events can take 5-20 minutes to appear
-   **Check Test Events** - Use the Test Events tool in Meta Events Manager
-   **Verify event names** - Standard events are case-sensitive
-   **Use event deduplication** - Add unique `eventID` to prevent duplicates
-   **Check ad blockers** - Some extensions block Meta Pixel

### TypeScript errors?

Make sure you have the latest version:

```bash
npm update @adkit/meta-pixel-nuxt
```

### Multiple pixels not working?

```typescript
// ✅ Correct
metaPixel: {
    pixelIds: ['ID_1', 'ID_2'],
}

// ❌ Incorrect
metaPixel: {
    pixelIds: 'ID_1,ID_2',
}
```

## 📖 Full Guide

For a complete step-by-step guide on installing and configuring Meta Pixel, check out our detailed tutorial:

**[How to Install Meta Pixel](https://adkit.so/resources/how-to-install-meta-pixel)**

## 📚 Official Documentation

Learn more about Meta Pixel from official Facebook resources:

-   **[Meta Pixel Reference](https://developers.facebook.com/docs/meta-pixel/reference/)** - Complete API reference
-   **[Standard Events Guide](https://developers.facebook.com/docs/meta-pixel/implementation/conversion-tracking#standard-events)** - Detailed event documentation
-   **[Object Properties Reference](https://developers.facebook.com/docs/meta-pixel/reference/#object-properties)** - All available event parameters
-   **[Conversions API](https://developers.facebook.com/docs/marketing-api/conversions-api)** - Server-side event tracking
-   **[Events Manager](https://www.facebook.com/events_manager2)** - Monitor your pixel events

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

MIT

---

**Made with ❤️ by [Adkit](https://adkit.so)**

If this package helped you, please consider giving it a ⭐️ on [GitHub](https://github.com/adkit/conversion-tracking)!
