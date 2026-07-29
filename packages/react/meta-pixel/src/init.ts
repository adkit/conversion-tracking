import META from '@adkit/meta-pixel';
import type { MetaPixelConfig } from '@adkit/meta-pixel';

/**
 * Initialize Meta Pixel (non-hook version)
 *
 * Call this once in your app root if you prefer not to use hooks.
 *
 * @param config - Meta Pixel configuration
 *
 * @example
 * ```tsx
 * // main.tsx or App.tsx
 * import { initMetaPixel } from '@adkit/meta-pixel-react'
 *
 * initMetaPixel({ pixelIds: 'YOUR_PIXEL_ID' })
 *
 * // Then use the hook anywhere
 * import { useMetaPixel } from '@adkit/meta-pixel-react'
 *
 * function MyComponent() {
 *   const meta = useMetaPixel()
 *   meta.track('Purchase', { value: 99.99, currency: 'USD' })
 * }
 * ```
 */
export function initMetaPixel(config: MetaPixelConfig): void {
    if (!META.isInitialized()) {
        META.init(config);
    }
}
