import React, { createContext, useEffect, ReactNode } from 'react'
import META from '@adkit/meta-pixel'
import type { MetaPixelInterface, MetaPixelConfig } from '@adkit/meta-pixel'

export interface MetaPixelProviderProps extends MetaPixelConfig {
  children: ReactNode
}

export const MetaPixelContext = createContext<MetaPixelInterface | null>(null)

/**
 * MetaPixelProvider - Initializes Meta Pixel tracking
 *
 * Wrap your app with this provider to enable Meta Pixel tracking throughout your application.
 *
 * @example
 * ```tsx
 * import { MetaPixelProvider } from '@adkit/meta-pixel-react'
 *
 * function App() {
 *   return (
 *     <MetaPixelProvider pixelIds="YOUR_PIXEL_ID">
 *       <YourApp />
 *     </MetaPixelProvider>
 *   )
 * }
 * ```
 */
export function MetaPixelProvider({
  children,
  pixelIds,
  autoTrackPageView = true,
  debug = false,
  enableLocalhost = false,
  loadMode = 'eager',
}: MetaPixelProviderProps) {
  useEffect(() => {
    if (!META.isInitialized()) {
      META.init({
        pixelIds,
        autoTrackPageView,
        debug,
        enableLocalhost,
        loadMode,
      })
    }
  }, [pixelIds, autoTrackPageView, debug, enableLocalhost, loadMode])

  return (
    <MetaPixelContext.Provider value={META}>
      {children}
    </MetaPixelContext.Provider>
  )
}
