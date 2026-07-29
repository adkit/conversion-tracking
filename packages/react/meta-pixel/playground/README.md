# Meta Pixel React - Playground

Interactive playground to test `@adkit/meta-pixel-react`

## Setup

```bash
cp .env.example .env
```

Then add your pixel ID in `.env`:

```
VITE_META_PIXEL_ID=YOUR_PIXEL_ID_HERE
```

**Note:** Vite requires env variables to be prefixed with `VITE_`

## Run

```bash
npm run dev
```

Open http://localhost:5174

## What's Demonstrated

- **Dashboard**: Shows pixel status and configuration
- **Manual Tracking**: Test standard events (Purchase, AddToCart, Lead)
- **All Events**: Quick access to all standard Meta Pixel events

## Usage Pattern

This playground uses the **Provider pattern** (recommended):

```tsx
<MetaPixelProvider pixelIds="YOUR_PIXEL_ID" debug={true}>
  <YourApp />
</MetaPixelProvider>

// Any component
const meta = useMetaPixel()
meta.track('Purchase', { value: 99.99, currency: 'USD' })
```
