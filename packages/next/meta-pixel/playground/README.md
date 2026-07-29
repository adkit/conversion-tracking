# Meta Pixel Next.js - Playground

Interactive playground to test `@adkit/meta-pixel-next`

## Setup

```bash
cp .env.example .env.local
```

Add your pixel ID:

```
NEXT_PUBLIC_META_PIXEL_ID=YOUR_PIXEL_ID_HERE
```

## Run

```bash
npm run dev
```

Open http://localhost:3000

## What's Demonstrated

- **Dashboard**: Pixel status and configuration
- **Manual Tracking**: Test Purchase, AddToCart, Lead, Custom events
- **About/Contact**: Test auto PageView on route changes

## Auto PageView Tracking

Navigate between pages and check the console - PageView is automatically tracked on every route change!
