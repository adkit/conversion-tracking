import { isValidElement, Suspense } from 'react'
import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const navigation = vi.hoisted(() => ({
  pathname: '/',
  searchParams: new URLSearchParams(),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useSearchParams: () => navigation.searchParams,
}))

beforeEach(() => {
  vi.resetModules()
  navigation.pathname = '/'
  navigation.searchParams = new URLSearchParams()
  delete window.fbq
  delete window._fbq
})

afterEach(() => {
  cleanup()
})

describe('MetaPixel loading mode', () => {
  it('forwards manual loading to the React provider', async () => {
    const { MetaPixel } = await import('../src')
    const result = MetaPixel({
      pixelId: 'test-id',
      loadMode: 'manual',
      trackPageViews: false,
    })

    expect(isValidElement<{ loadMode?: string }>(result)).toBe(true)

    if (!isValidElement<{ loadMode?: string }>(result)) {
      throw new Error('MetaPixel should return a React element')
    }

    expect(result.props.loadMode).toBe('manual')
  })

  it('isolates the search-parameter tracker behind Suspense', async () => {
    const { MetaPixel } = await import('../src')
    const result = MetaPixel({
      pixelId: 'test-id',
    })

    if (!isValidElement<{ children?: unknown }>(result)) {
      throw new Error('MetaPixel should return a React element')
    }

    const [tracker] = Array.isArray(result.props.children)
      ? result.props.children
      : [result.props.children]

    expect(isValidElement(tracker)).toBe(true)

    if (!isValidElement(tracker)) {
      throw new Error('MetaPixel should render its route tracker')
    }

    expect(tracker.type).toBe(Suspense)
  })

  it('tracks the initial page and each later route once', async () => {
    const fbq = vi.fn()
    window.fbq = fbq
    const { MetaPixel } = await import('../src')
    const view = render(
      <MetaPixel
        pixelId="pixel-1"
        enableLocalhost
        loadMode="manual"
      />,
    )

    expect(fbq).toHaveBeenCalledWith('init', 'pixel-1')
    expect(fbq).toHaveBeenCalledWith('track', 'PageView')

    navigation.pathname = '/pricing'
    navigation.searchParams = new URLSearchParams('plan=pro')
    view.rerender(
      <MetaPixel
        pixelId="pixel-1"
        enableLocalhost
        loadMode="manual"
      />,
    )

    expect(fbq.mock.calls.filter(([command, event]) => command === 'track' && event === 'PageView')).toHaveLength(2)
  })

  it('does not track route changes when pageview tracking is disabled', async () => {
    const fbq = vi.fn()
    window.fbq = fbq
    const { MetaPixel } = await import('../src')
    const view = render(
      <MetaPixel
        pixelId="pixel-1"
        enableLocalhost
        loadMode="manual"
        trackPageViews={false}
      />,
    )

    navigation.pathname = '/pricing'
    view.rerender(
      <MetaPixel
        pixelId="pixel-1"
        enableLocalhost
        loadMode="manual"
        trackPageViews={false}
      />,
    )

    expect(fbq.mock.calls.filter(([command, event]) => command === 'track' && event === 'PageView')).toHaveLength(1)
  })
})
