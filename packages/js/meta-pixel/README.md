# Meta Pixel (JS/TS)

[![npm version](https://img.shields.io/npm/v/@adkit/meta-pixel.svg)](https://www.npmjs.com/package/@adkit/meta-pixel)
[![npm downloads](https://img.shields.io/npm/dm/@adkit/meta-pixel.svg)](https://www.npmjs.com/package/@adkit/meta-pixel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> The most powerful and developer-friendly Meta Pixel integration for JavaScript & TypeScript applications.

A platform-agnostic wrapper for Meta Pixel that provides a seamless, type-safe experience with advanced features like event deduplication, multiple pixel support, and beautiful debug logging.

## 📚 Table of Contents

-   [Features](#-features)
-   [Quick Start](#-quick-start)
-   [Installation](#-installation)
-   [Usage](#-usage)
-   [Configuration](#%EF%B8%8F-configuration)
-   [Standard Events](#-standard-events)
-   [Event Data Parameters](#-event-data-parameters)
-   [Advanced Usage](#-advanced-usage)
-   [TypeScript Support](#-typescript-support)
-   [Troubleshooting](#-troubleshooting)
-   [Official Documentation](#-official-documentation)
-   [License](#-license)

## ✨ Features

-   ✅ **Typescript Support** - Full TypeScript support with autocomplete for all official events and parameters
-   🎯 **Custom Events Support** - Track custom events with full type safety and flexible data structures
-   🚦 **Event Deduplication** - Support for preventing duplicate events with event IDs
-   🔌 **Multiple Pixels Support** - Load and manage multiple pixel IDs effortlessly
-   ⏱️ **Flexible Loading** - Download Meta eagerly, lazily, or on a host-controlled schedule
-   🐛 **Debug Mode** - Beautiful styled console logs for development and debugging
-   🏠 **Localhost Support** - Easy configuration to enable/disable tracking on localhost

## ⚡ Quick Start

```bash
npm install @adkit/meta-pixel
```

```typescript
import META from '@adkit/meta-pixel';

// 1. Initialize
META.init({ pixelIds: 'YOUR_PIXEL_ID' });

// 2. Track events
META.track('Purchase', { value: 99.99, currency: 'USD' });
```

That's it! 🎉

## 📦 Installation

```bash
npm install @adkit/meta-pixel
```

## 💡 Usage

### Basic Initialization

Initialize the pixel as early as possible in your application entry point (e.g., `main.ts`, `App.jsx`, `index.js`).

```typescript
import META from '@adkit/meta-pixel';

META.init({
    pixelIds: '1234567890',
    autoTrackPageView: true, // default: true
});
```

### Tracking Events

```typescript
// Track standard events
META.track('AddToCart', {
    value: 29.99,
    currency: 'USD',
    content_ids: ['SKU_123'],
    content_type: 'product',
});

// Track custom events
META.trackCustom('MyCustomEvent', {
    custom_param: 'value',
});
```

### Multiple Instances

If you need separate instances for different parts of your application (rare):

```typescript
import { createMetaPixel } from '@adkit/meta-pixel';

const marketingPixel = createMetaPixel();
marketingPixel.init({ pixelIds: 'MARKETING_ID' });

const productPixel = createMetaPixel();
productPixel.init({ pixelIds: 'PRODUCT_ID' });
```

## ⚙️ Configuration

### Configuration Options

| Option              | Type                 | Default | Description                                         |
| ------------------- | -------------------- | ------- | --------------------------------------------------- |
| `pixelIds`          | `string \| string[]` | `''`    | **Required.** Single pixel ID or array of pixel IDs |
| `autoTrackPageView` | `boolean`            | `true`  | Automatically track PageView on initialization      |
| `debug`             | `boolean`            | `false` | Enable styled console logs with background colors   |
| `enableLocalhost`   | `boolean`            | `false` | Enable tracking on localhost (useful for testing)   |
| `loadMode`          | `'eager' \| 'lazy' \| 'manual'` | `'eager'` | Choose when to download `fbevents.js`                |

### Loading Modes

-   `eager` downloads `fbevents.js` during initialization. This is the default and preserves existing behavior.
-   `lazy` installs Meta's event queue immediately, then downloads `fbevents.js` after the page has loaded and the browser has an idle opportunity.
-   `manual` installs the queue immediately but waits for the host application to call `META.load()`.

Events tracked while the script is deferred stay in Meta's native `fbq.queue`, including the fourth `eventID` argument.

```typescript
META.init({
    pixelIds: 'YOUR_PIXEL_ID',
    loadMode: 'manual',
});

META.track('Purchase', { value: 99 }, { eventID: 'order-123' });

// Call this from your own vendor-loading schedule.
META.load();
```

### Multiple Pixels Example

```typescript
META.init({
    pixelIds: ['PIXEL_ID_1', 'PIXEL_ID_2', 'PIXEL_ID_3'],
    debug: true,
});
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

## 📋 Event Data Parameters

All event parameters are optional but help improve ad targeting and conversion tracking.

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

You can find the list of properties [here](https://developers.facebook.com/docs/meta-pixel/reference/#object-properties)

## 🚀 Advanced Usage

### Event Deduplication

Prevent duplicate event tracking by using unique event IDs. This is crucial when tracking conversions from both client and server (CAPI).

```typescript
const orderId = '12345';

META.track(
    'Purchase',
    {
        value: 299.99,
        currency: 'USD',
        content_ids: ['SKU_123'],
    },
    {
        eventID: `order-${orderId}`, // Unique Event ID
    },
);
```

### Check if the Pixel Queue Is Ready

`isLoaded()` reports whether the public `fbq` queue is ready to accept events. In lazy and manual modes, it becomes ready before `fbevents.js` is downloaded.

```typescript
if (META.isLoaded()) {
    META.track('Purchase', { value: 99.99, currency: 'USD' });
} else {
    console.log('Pixel not loaded yet');
}
```

### Debug Mode

When `debug: true` is passed to `init()`, you'll see beautiful styled console logs:

-   🔵 **[Meta Pixel]** Info messages (blue background)
-   ✅ **[Meta Pixel]** Success messages (green background)
-   ⚠️ **[Meta Pixel]** Warning messages (orange background)

```typescript
META.init({
    pixelIds: 'YOUR_ID',
    debug: true,
});
```

## 📝 TypeScript Support

This package is written in TypeScript and bundles type definitions.

```typescript
import type { StandardEvent, EventData, MetaPixelConfig } from '@adkit/meta-pixel';

const config: MetaPixelConfig = {
    pixelIds: '123',
};

const eventData: EventData = {
    value: 100,
    currency: 'USD',
};
```

## ❓ Troubleshooting

### Pixel not loading?

1. **Check your pixel ID** - Make sure it's correct in your config
2. **Enable debug mode** - Set `debug: true` in `init()` to see detailed logs
3. **Check browser console** - Look for errors or warnings
4. **Check Ad Blockers** - Ad blockers often block the Meta Pixel script
5. **Enable on localhost** - Set `enableLocalhost: true` if testing locally

### Events not showing in Meta Events Manager?

-   **Wait a few minutes** - Events can take 5-20 minutes to appear
-   **Check Test Events** - Use the Test Events tool in Meta Events Manager
-   **Verify event names** - Standard events are case-sensitive

## 📚 Official Documentation

Learn more about Meta Pixel from official Facebook resources:

-   **[Meta Pixel Reference](https://developers.facebook.com/docs/meta-pixel/reference/)** - Complete API reference
-   **[Standard Events Guide](https://developers.facebook.com/docs/meta-pixel/implementation/conversion-tracking#standard-events)** - Detailed event documentation
-   **[Object Properties Reference](https://developers.facebook.com/docs/meta-pixel/reference/#object-properties)** - All available event parameters
-   **[Conversions API](https://developers.facebook.com/docs/marketing-api/conversions-api)** - Server-side event tracking
-   **[Events Manager](https://www.facebook.com/events_manager2)** - Monitor your pixel events

## 🔗 Platform Packages

Using a framework? Check out our dedicated packages:

-   [**Nuxt**](https://www.npmjs.com/package/@adkit/meta-pixel-nuxt) - `@adkit/meta-pixel-nuxt`
-   [**React**](https://www.npmjs.com/package/@adkit/meta-pixel-react) - `@adkit/meta-pixel-react`
-   [**Next.js**](https://www.npmjs.com/package/@adkit/meta-pixel-next) - `@adkit/meta-pixel-next`

## 📖 Full Guide

For a complete step-by-step guide on installing and configuring Meta Pixel, check out our detailed tutorial:

**[How to Install Meta Pixel](https://adkit.so/resources/how-to-install-meta-pixel)**

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

MIT

---

**Made with ❤️ by [Adkit](https://adkit.so)**

If this package helped you, please consider giving it a ⭐️ on [GitHub](https://github.com/adkit/ads-tracking)!
