import { useEffect, useContext } from 'react'
import { MetaPixelContext } from './MetaPixelProvider'
import META from '@adkit/meta-pixel'
import type { MetaPixelInterface, MetaPixelConfig } from '@adkit/meta-pixel'

/**
 * useMetaPixel - Hook to access Meta Pixel tracking methods
 *
 * Can be used in two ways:
 *
 * 1. **Standalone (Recommended)**: Initialize once at your app root, then use anywhere
 * 2. **With Provider**: Use within a MetaPixelProvider for React Context pattern
 *
 * @param config - Optional config to initialize Meta Pixel (only needed once at app root)
 * @returns Meta Pixel instance with track, trackCustom, and isLoaded methods
 *
 * @example
 * **Standalone Usage (Simpler):**
 * ```tsx
 * // App.tsx - Initialize once
 * function App() {
 *   useMetaPixel({ pixelIds: 'YOUR_PIXEL_ID' })
 *   return <YourApp />
 * }
 *
 * // Any component - Just use it
 * function MyComponent() {
 *   const meta = useMetaPixel()
 *   meta.track('Purchase', { value: 99.99, currency: 'USD' })
 * }
 * ```
 *
 * @example
 * **With Provider (Alternative):**
 * ```tsx
 * // App.tsx
 * <MetaPixelProvider pixelIds="YOUR_PIXEL_ID">
 *   <YourApp />
 * </MetaPixelProvider>
 *
 * // Any component
 * function MyComponent() {
 *   const meta = useMetaPixel()
 *   meta.track('Purchase', { value: 99.99, currency: 'USD' })
 * }
 * ```
 */
export function useMetaPixel(config?: MetaPixelConfig): MetaPixelInterface {
  // Check if we're inside a Provider
  const context = useContext(MetaPixelContext)

  // Initialize if config is provided (standalone mode)
  useEffect(() => {
    if (config && !META.isInitialized()) {
      META.init(config)
    }
  }, [config?.pixelIds, config?.autoTrackPageView, config?.debug, config?.enableLocalhost, config?.loadMode])

  // Return context if available (Provider mode), otherwise return global META instance
  return context || META
}
