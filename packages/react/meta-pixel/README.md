# Meta (Facebook) Pixel for React

Add the Meta Pixel to your React app with a Provider and a hook instead of Facebook's copy-paste snippet. Type-safe standard and custom events, event deduplication for the Conversions API, and lazy script loading that keeps fbevents.js off your critical path.

[![npm version](https://img.shields.io/npm/v/@adkit/meta-pixel-react.svg)](https://www.npmjs.com/package/@adkit/meta-pixel-react)
[![npm downloads](https://img.shields.io/npm/dm/@adkit/meta-pixel-react.svg)](https://www.npmjs.com/package/@adkit/meta-pixel-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Built on [@adkit/meta-pixel](https://www.npmjs.com/package/@adkit/meta-pixel), the framework-independent core.

## 📚 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#%EF%B8%8F-configuration)
- [Usage](#-usage)
- [Standard Events](#-standard-events)
- [Event Data Parameters](#-event-data-parameters)
- [Advanced Usage](#-advanced-usage)
- [Alternative Patterns](#-alternative-patterns)
- [TypeScript Support](#-typescript-support)
- [Troubleshooting](#-troubleshooting)
- [Official Documentation](#-official-documentation)
- [License](#-license)

## ✨ Features

- ✅ **TypeScript Support** - Full TypeScript support with autocomplete for all official events and parameters
- 🎯 **Custom Events Support** - Track custom events with full type safety and flexible data structures
- 🚦 **Event Deduplication** - Support for preventing duplicate events with event IDs
- 🔌 **Multiple Pixels Support** - Load and manage multiple pixel IDs effortlessly
- 🐛 **Debug Mode** - Beautiful styled console logs for development and debugging
- 🏠 **Localhost Support** - Easy configuration to enable/disable tracking on localhost
- ⚛️ **React Context Pattern** - Clean Provider/Hook pattern that feels native to React

## 📱 Using Next.js?

Use [@adkit/meta-pixel-next](https://www.npmjs.com/package/@adkit/meta-pixel-next) instead! It provides:

- **Auto PageView tracking on route changes** (this package doesn't do that)
- Simple `<MetaPixel />` component - no Provider needed
- Environment variable support (`NEXT_PUBLIC_META_PIXEL_ID`)

```bash
npm install @adkit/meta-pixel-next
```

## ⚠️ Important: PageView Tracking on Route Changes

**This package tracks PageView on initial load only.** It does NOT automatically track PageView when navigating between pages in a Single Page Application (SPA).

### Why?

React apps use client-side routing (React Router, etc.) which doesn't trigger full page reloads. The Meta Pixel script only fires PageView once when the page loads.

### How to handle route changes?

**Option 1: Use the Next.js package** (recommended for Next.js)

```bash
npm install @adkit/meta-pixel-next
```

**Option 2: Manually track PageView on route changes**

```tsx
// With React Router
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useMetaPixel } from '@adkit/meta-pixel-react'

function RouteChangeTracker() {
  const location = useLocation()
  const meta = useMetaPixel()
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip first render (initial PageView is auto-tracked)
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Track PageView on route change
    if (meta.isLoaded()) {
      meta.track('PageView')
    }
  }, [location.pathname])

  return null
}

// Add to your App
function App() {
  return (
    <MetaPixelProvider pixelIds="YOUR_PIXEL_ID">
      <RouteChangeTracker />
      <YourRoutes />
    </MetaPixelProvider>
  )
}
```

## ⚡ Quick Start

```bash
npm install @adkit/meta-pixel-react
```

```tsx
import { MetaPixelProvider, useMetaPixel } from '@adkit/meta-pixel-react'

// 1. Wrap your app
function App() {
  return (
    <MetaPixelProvider pixelIds="YOUR_PIXEL_ID">
      <YourApp />
    </MetaPixelProvider>
  )
}

// 2. Track events anywhere
function ProductPage() {
  const meta = useMetaPixel()

  function handlePurchase() {
    meta.track('Purchase', { value: 99.99, currency: 'USD' })
  }

  return <button onClick={handlePurchase}>Buy Now</button>
}
```

## 📦 Installation

```bash
npm install @adkit/meta-pixel-react
```

```bash
yarn add @adkit/meta-pixel-react
```

```bash
pnpm add @adkit/meta-pixel-react
```

## ⚙️ Configuration

### Basic Setup

Wrap your app with the `MetaPixelProvider` component:

```tsx
import { MetaPixelProvider } from '@adkit/meta-pixel-react'

function App() {
  return (
    <MetaPixelProvider
      pixelIds="YOUR_PIXEL_ID"
      autoTrackPageView={true}
      debug={false}
      enableLocalhost={false}
      loadMode="lazy"
    >
      <YourApp />
    </MetaPixelProvider>
  )
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pixelIds` | `string \| string[]` | **required** | Single pixel ID or array of pixel IDs |
| `autoTrackPageView` | `boolean` | `true` | Automatically track PageView on initialization |
| `debug` | `boolean` | `false` | Enable styled console logs with background colors |
| `enableLocalhost` | `boolean` | `false` | Enable tracking on localhost (useful for testing) |
| `loadMode` | `'eager' \| 'lazy' \| 'manual'` | `'eager'` | Choose when to download Meta's vendor script |
| `children` | `ReactNode` | **required** | Your React components |

`lazy` creates Meta's event queue immediately, then downloads the vendor script after the page load and an idle browser opportunity. `manual` creates the queue immediately and waits for `useMetaPixel().load()` to be called. Events sent before the download remain queued.

### Multiple Pixels Example

```tsx
<MetaPixelProvider
  pixelIds={['PIXEL_ID_1', 'PIXEL_ID_2', 'PIXEL_ID_3']}
  debug={true}
  enableLocalhost={true}
>
  <App />
</MetaPixelProvider>
```

### Using Environment Variables

```tsx
// .env.local
META_PIXEL_ID=123456789012345
REACT_APP_META_PIXEL_ID=123456789012345
```

```tsx
// App.tsx
<MetaPixelProvider pixelIds={import.meta.env.META_PIXEL_ID}>
  <App />
</MetaPixelProvider>
```

## 💡 Usage

The `useMetaPixel()` hook provides direct access to the Meta Pixel instance with all tracking methods. It must be used within a `MetaPixelProvider`.

### Basic Usage

```tsx
import { useMetaPixel } from '@adkit/meta-pixel-react'

function ProductPage() {
  const meta = useMetaPixel()

  function handleAddToCart() {
    meta.track('AddToCart', {
      content_name: 'Wireless Headphones',
      content_ids: ['SKU_789'],
      value: 149.99,
      currency: 'USD'
    })
  }

  return <button onClick={handleAddToCart}>Add to Cart</button>
}
```

### Tracking on Component Mount

```tsx
import { useEffect } from 'react'
import { useMetaPixel } from '@adkit/meta-pixel-react'

function ProductPage({ product }) {
  const meta = useMetaPixel()

  useEffect(() => {
    // Track page view when component mounts
    meta.track('ViewContent', {
      content_name: product.name,
      content_ids: [product.id],
      value: product.price,
      currency: 'USD'
    })
  }, [product.id])

  return <div>{product.name}</div>
}
```

### With Event Deduplication

```tsx
import { useMetaPixel } from '@adkit/meta-pixel-react'

function CheckoutPage() {
  const meta = useMetaPixel()

  async function handlePurchase() {
    const orderId = await processOrder()

    meta.track(
      'Purchase',
      {
        value: 299.99,
        currency: 'USD',
        content_ids: ['SKU_123']
      },
      {
        eventID: `order-${orderId}` // Prevents duplicates
      }
    )
  }

  return <button onClick={handlePurchase}>Complete Purchase</button>
}
```

### Check if Pixel is Loaded

```tsx
import { useMetaPixel } from '@adkit/meta-pixel-react'

function MyComponent() {
  const meta = useMetaPixel()

  function trackIfReady() {
    if (meta.isLoaded()) meta.track('Purchase', { value: 99.99, currency: 'USD' })
    else console.log('Pixel not loaded yet')
  }

  return <button onClick={trackIfReady}>Buy Now</button>
}
```

## 🐛 Debug Mode

When `debug={true}`, you'll see beautiful styled console logs:

- 🔵 **[Meta Pixel]** Info messages (blue background)
- ✅ **[Meta Pixel]** Success messages (green background)
- ⚠️ **[Meta Pixel]** Warning messages (orange background)

Example output:

```
[Meta Pixel] Initializing Meta Pixel... { pixelIds: [...], autoTrackPageView: true }
[Meta Pixel] ✓ Meta Pixel initialized successfully
[Meta Pixel] Tracking standard event: "Purchase" { data: {...}, eventData: {...} }
```

```tsx
<MetaPixelProvider
  pixelIds="YOUR_PIXEL_ID"
  debug={true}
>
  <App />
</MetaPixelProvider>
```

## 📊 Standard Events

All Meta Pixel standard events are supported with full TypeScript autocomplete. These events help you track important actions on your website and optimize your ad campaigns.

| Event | Description | Common Use Cases |
|-------|-------------|------------------|
| `AddPaymentInfo` | Payment info added | Checkout flow |
| `AddToCart` | Item added to shopping cart | E-commerce |
| `AddToWishlist` | Item added to wishlist | E-commerce |
| `CompleteRegistration` | User completed registration | Sign-ups, account creation |
| `Contact` | User contacted business | Contact forms |
| `CustomizeProduct` | Product customization started | Product configurators |
| `Donate` | Donation made | Non-profits |
| `FindLocation` | Location finder used | Store locators |
| `InitiateCheckout` | Checkout process started | E-commerce funnels |
| `Lead` | Lead submitted | Lead generation forms |
| `Purchase` | Purchase completed | Transaction confirmation |
| `Schedule` | Appointment scheduled | Booking systems |
| `Search` | Search performed | Site search |
| `StartTrial` | Trial started | SaaS applications |
| `SubmitApplication` | Application submitted | Job boards, loan applications |
| `Subscribe` | Subscription started | Newsletters, subscriptions |
| `ViewContent` | Content viewed | Product pages, blog posts |

You can find the official list of standard events [here](https://developers.facebook.com/docs/meta-pixel/reference/#standard-events).

### Example Usage

```tsx
import { useMetaPixel } from '@adkit/meta-pixel-react'

function EcommerceExample() {
  const meta = useMetaPixel()

  function trackPurchase() {
    meta.track('Purchase', {
      value: 299.99,
      currency: 'USD',
      content_ids: ['SKU_12345'],
      content_type: 'product',
      num_items: 1
    })
  }

  function trackLead() {
    meta.track('Lead', { content_name: 'Newsletter Signup', content_category: 'Marketing' })
  }

  function trackSearch(query: string) {
    meta.track('Search', { search_string: query })
  }

  return (
    <div>
      <button onClick={trackPurchase}>Complete Purchase</button>
      <button onClick={trackLead}>Sign Up</button>
      <input onChange={(e) => trackSearch(e.target.value)} placeholder="Search..." />
    </div>
  )
}
```

## 📋 Event Data Parameters

All event parameters are optional but help improve ad targeting and conversion tracking. Here are the most common ones:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `value` | `number` | Monetary value of the event | `99.99` |
| `currency` | `string` | ISO 4217 currency code | `'USD'`, `'EUR'`, `'GBP'` |
| `content_ids` | `string[]` | Product IDs or SKUs | `['SKU_123', 'SKU_456']` |
| `content_type` | `string` | Type of content | `'product'`, `'product_group'` |
| `content_name` | `string` | Name of page/product | `'Blue T-Shirt'` |
| `content_category` | `string` | Category of page/product | `'Apparel'`, `'Electronics'` |
| `contents` | `Array<{id, quantity}>` | Detailed product information | `[{id: 'SKU_123', quantity: 2}]` |
| `num_items` | `number` | Number of items | `3` |
| `search_string` | `string` | Search query | `'running shoes'` |
| `status` | `boolean` | Registration/subscription status | `true` |
| `predicted_ltv` | `number` | Predicted lifetime value of customer | `450.00` |

You can find the list of properties [here](https://developers.facebook.com/docs/meta-pixel/reference/#object-properties).

### Complete E-commerce Example

```tsx
import { useState, useEffect } from 'react'
import { useMetaPixel } from '@adkit/meta-pixel-react'

function ProductPage() {
  const meta = useMetaPixel()
  const [product] = useState({
    id: 'SKU_789',
    name: 'Wireless Headphones',
    price: 149.99,
    category: 'Electronics'
  })

  // Track page view when component mounts
  useEffect(() => {
    meta.track('ViewContent', {
      content_ids: [product.id],
      content_type: 'product',
      content_name: product.name,
      content_category: product.category,
      value: product.price,
      currency: 'USD'
    })
  }, [product.id])

  function handleAddToCart() {
    meta.track('AddToCart', {
      content_ids: [product.id],
      content_type: 'product',
      content_name: product.name,
      value: product.price,
      currency: 'USD'
    })
  }

  async function handlePurchase() {
    const orderId = await processOrder()

    meta.track(
      'Purchase',
      {
        content_ids: [product.id],
        content_type: 'product',
        value: product.price,
        currency: 'USD',
        num_items: 1
      },
      {
        eventID: orderId // For deduplication
      }
    )
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>${product.price}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
      <button onClick={handlePurchase}>Buy Now</button>
    </div>
  )
}
```

## 🚀 Advanced Usage

### Custom Events

Track custom events specific to your business:

```tsx
import { useMetaPixel } from '@adkit/meta-pixel-react'

function PricingPage() {
  const meta = useMetaPixel()

  function trackPricingView() {
    meta.trackCustom('PricingPageViewed', { plan: 'enterprise', duration: 'annual' })
  }

  function trackVideoComplete() {
    meta.trackCustom('VideoWatched', { video_id: 'intro_2024', watch_percentage: 100 })
  }

  return (
    <div>
      <button onClick={trackPricingView}>View Pricing</button>
      <video onEnded={trackVideoComplete}>Your video</video>
    </div>
  )
}
```

### Event Deduplication

Prevent duplicate event tracking by using unique event IDs. This is crucial when tracking conversions from both client and server (Conversions API):

```tsx
import { useMetaPixel } from '@adkit/meta-pixel-react'

function CheckoutPage() {
  const meta = useMetaPixel()

  async function processOrder() {
    const orderId = await createOrder()

    // Use order ID as event ID to prevent duplicates
    meta.track(
      'Purchase',
      {
        value: 299.99,
        currency: 'USD',
        content_ids: ['SKU_123']
      },
      {
        eventID: `order-${orderId}`
      }
    )

    // Even if this fires multiple times or from server too,
    // Meta will deduplicate based on eventID
  }

  return <button onClick={processOrder}>Complete Order</button>
}
```

### Conditional Tracking

```tsx
import { useMetaPixel } from '@adkit/meta-pixel-react'

function RegisterPage() {
  const meta = useMetaPixel()
  const { user } = useAuth()

  async function handleRegistration() {
    // Only track if pixel is loaded
    if (!meta.isLoaded()) {
      console.warn('Meta Pixel not loaded yet')
      return
    }

    // Track registration with user context
    meta.track('CompleteRegistration', {
      status: true,
      content_name: user.accountType,
      value: user.predictedLTV
    })
  }

  return <button onClick={handleRegistration}>Sign Up</button>
}
```

### Lead Form Example

```tsx
import { useState, FormEvent } from 'react'
import { useMetaPixel } from '@adkit/meta-pixel-react'

function ContactForm() {
  const meta = useMetaPixel()
  const [formData, setFormData] = useState({ name: '', email: '' })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    // Track the lead
    meta.track('Lead', {
      content_name: 'Contact Form Submission',
      content_category: 'Contact',
      value: 10.00 // Estimated lead value
    })

    await submitForm(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Name"
        required
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        required
      />
      <button type="submit">Submit</button>
    </form>
  )
}
```

### Search Functionality Example

```tsx
import { useState } from 'react'
import { useMetaPixel } from '@adkit/meta-pixel-react'

function SearchBar() {
  const meta = useMetaPixel()
  const [query, setQuery] = useState('')

  function handleSearch(e: FormEvent) {
    e.preventDefault()

    meta.track('Search', { search_string: query })

    performSearch(query)
  }

  return (
    <form onSubmit={handleSearch}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
      />
      <button type="submit">Search</button>
    </form>
  )
}
```

## 🔄 Alternative Patterns

While the Provider pattern is recommended for most React applications, we offer alternative patterns if you prefer different approaches:

### Pattern 1: Provider (Recommended)

```tsx
import { MetaPixelProvider, useMetaPixel } from '@adkit/meta-pixel-react'

function App() {
  return (
    <MetaPixelProvider pixelIds="YOUR_PIXEL_ID">
      <Component />
    </MetaPixelProvider>
  )
}

function Component() {
  const meta = useMetaPixel()
  meta.track('Purchase', { value: 99, currency: 'USD' })
}
```

**Pros:** Clean React Context pattern, explicit initialization, works well with other providers

### Pattern 2: Hook with Config

```tsx
import { useMetaPixel } from '@adkit/meta-pixel-react'

function App() {
  // Initialize once at root
  useMetaPixel({ pixelIds: 'YOUR_PIXEL_ID' })
  return <Component />
}

function Component() {
  // Use anywhere without config
  const meta = useMetaPixel()
  meta.track('Purchase', { value: 99, currency: 'USD' })
}
```

**Pros:** No wrapper component, minimal code, still uses hooks

### Pattern 3: Init Function

```tsx
import { initMetaPixel, useMetaPixel } from '@adkit/meta-pixel-react'

// In main.tsx or index.tsx
initMetaPixel({ pixelIds: 'YOUR_PIXEL_ID' })

// Then in your components
function Component() {
  const meta = useMetaPixel()
  meta.track('Purchase', { value: 99, currency: 'USD' })
}
```

**Pros:** Can initialize outside components, useful for entry files like `main.tsx`

## 📝 TypeScript Support

Full type safety with exported types:

```tsx
import type {
  StandardEvent,
  EventData,
  EventMetaData,
  MetaPixelConfig
} from '@adkit/meta-pixel-react'

const config: MetaPixelConfig = { pixelIds: 'YOUR_PIXEL_ID', debug: true }

function trackEvent(event: StandardEvent, data: EventData) {
  const meta = useMetaPixel()
  meta.track(event, data)
}
```

All methods, events, and parameters have complete TypeScript definitions with IntelliSense support in your IDE.

## ❓ Troubleshooting

### Does the Facebook Pixel slow down my React app?

fbevents.js is loaded `async`, so it doesn't block HTML parsing. To keep the download out of your Core Web Vitals window entirely, pass `loadMode="lazy"` to the Provider: the event queue is created immediately, but the script only downloads after the page `load` event, at the browser's next idle moment. Events fired in the meantime are queued and sent once the script arrives.

### Pixel not loading?

1. **Check your pixel ID** - Make sure it's correct in your config
2. **Enable debug mode** - Set `debug={true}` to see detailed logs
3. **Check browser console** - Look for errors or warnings
4. **Check Ad Blockers** - Ad blockers often block the Meta Pixel script
5. **Enable on localhost** - Set `enableLocalhost={true}` for local testing

### Hook error "must be used within MetaPixelProvider"?

Make sure your components are wrapped with `MetaPixelProvider`:

```tsx
// ✅ Correct
<MetaPixelProvider pixelIds="YOUR_PIXEL_ID">
  <Component />
</MetaPixelProvider>

// ❌ Wrong - Hook called outside Provider
<Component />
```

### Events not showing in Meta Events Manager?

- **Wait a few minutes** - Events can take 5-20 minutes to appear
- **Check Test Events** - Use the Test Events tool in Meta Events Manager
- **Verify event names** - Standard events are case-sensitive
- **Use event deduplication** - Add unique `eventID` to prevent duplicates

### TypeScript errors?

Make sure you have the latest version:

```bash
npm update @adkit/meta-pixel-react
```

### Multiple pixels not working?

```tsx
// ✅ Correct
<MetaPixelProvider pixelIds={['ID_1', 'ID_2']}>
  <App />
</MetaPixelProvider>

// ❌ Incorrect
<MetaPixelProvider pixelIds="ID_1,ID_2">
  <App />
</MetaPixelProvider>
```

## 📚 Official Documentation

Learn more about Meta Pixel from official Facebook resources:

- **[Meta Pixel Reference](https://developers.facebook.com/docs/meta-pixel/reference/)** - Complete API reference
- **[Standard Events Guide](https://developers.facebook.com/docs/meta-pixel/implementation/conversion-tracking#standard-events)** - Detailed event documentation
- **[Object Properties Reference](https://developers.facebook.com/docs/meta-pixel/reference/#object-properties)** - All available event parameters
- **[Conversions API](https://developers.facebook.com/docs/marketing-api/conversions-api)** - Server-side event tracking
- **[Events Manager](https://www.facebook.com/events_manager2)** - Monitor your pixel events

## 🔗 Related Packages

- [@adkit/meta-pixel](https://www.npmjs.com/package/@adkit/meta-pixel) - Core JavaScript package
- [@adkit/meta-pixel-nuxt](https://www.npmjs.com/package/@adkit/meta-pixel-nuxt) - Nuxt module
- [@adkit/meta-pixel-next](https://www.npmjs.com/package/@adkit/meta-pixel-next) - Next.js package with auto PageView tracking

## 📖 Full Guide

For a complete step-by-step guide on installing and configuring Meta Pixel, check out our detailed tutorial:

**[How to Install Meta Pixel](https://adkit.so/resources/how-to-install-meta-pixel)**

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

MIT

---

**Made with ❤️ by [Adkit](https://adkit.so)**

If this package helped you, please consider giving it a ⭐️ on [GitHub](https://github.com/adkit/conversion-tracking)!
