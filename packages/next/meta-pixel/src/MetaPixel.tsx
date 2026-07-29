'use client'

import { Suspense, useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { MetaPixelProvider, useMetaPixel } from '@adkit/meta-pixel-react'
import type { MetaPixelLoadMode } from '@adkit/meta-pixel-react'
import type { ReactNode } from 'react'

export interface MetaPixelProps {
  /** Your Meta Pixel ID(s). Can also use NEXT_PUBLIC_META_PIXEL_ID env var */
  pixelId?: string | string[]
  /** Enable debug logging to console (default: false) */
  debug?: boolean
  /** Enable tracking on localhost (default: false) */
  enableLocalhost?: boolean
  /** Control when the Meta vendor script downloads (default: eager) */
  loadMode?: MetaPixelLoadMode
  /** Auto track PageView on route changes (default: true) */
  trackPageViews?: boolean
  /** Children to render */
  children?: ReactNode
}

/**
 * Meta Pixel component for Next.js
 *
 * Features:
 * - Auto tracks PageView on initial load
 * - Auto tracks PageView on route changes (App Router)
 * - Supports environment variable NEXT_PUBLIC_META_PIXEL_ID
 *
 * @example
 * // app/layout.tsx
 * import { MetaPixel } from '@adkit/meta-pixel-next'
 *
 * export default function Layout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <MetaPixel pixelId="123456789" debug={true}>
 *           {children}
 *         </MetaPixel>
 *       </body>
 *     </html>
 *   )
 * }
 */
export function MetaPixel({
  pixelId,
  debug = false,
  enableLocalhost = false,
  loadMode = 'eager',
  trackPageViews = true,
  children,
}: MetaPixelProps) {
  // Use env var as fallback
  const resolvedPixelId = pixelId || process.env.NEXT_PUBLIC_META_PIXEL_ID || ''

  if (!resolvedPixelId) {
    console.warn('[Meta Pixel] No pixel ID provided. Set pixelId prop or NEXT_PUBLIC_META_PIXEL_ID env var.')
    return <>{children}</>
  }

  return (
    <MetaPixelProvider
      pixelIds={resolvedPixelId}
      debug={debug}
      enableLocalhost={enableLocalhost}
      loadMode={loadMode}
      autoTrackPageView={true}
    >
      {trackPageViews && (
        <Suspense fallback={null}>
          <RouteChangeTracker debug={debug} />
        </Suspense>
      )}
      {children}
    </MetaPixelProvider>
  )
}

/**
 * Internal component that tracks PageView on route changes
 */
function RouteChangeTracker({ debug }: { debug: boolean }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const meta = useMetaPixel()
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip first render (initial PageView is handled by autoTrackPageView)
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Track PageView on route change
    if (meta.isLoaded()) {
      meta.track('PageView')
      if (debug) {
        console.log('[Meta Pixel] PageView tracked for:', pathname + (searchParams?.toString() ? `?${searchParams}` : ''))
      }
    }
  }, [pathname, searchParams, meta, debug])

  return null
}
