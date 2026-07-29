import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, renderHook } from '@testing-library/react'

beforeEach(() => {
  vi.resetModules()
  delete window.fbq
  delete window._fbq
})

describe('pre-existing Meta queue compatibility', () => {
  it('initializes the configured pixel through the provider', async () => {
    const fbq = vi.fn()
    window.fbq = fbq
    const { MetaPixelProvider } = await import('../src')

    render(
      <MetaPixelProvider
        pixelIds="pixel-1"
        enableLocalhost
        loadMode="manual"
      >
        <div>Content</div>
      </MetaPixelProvider>,
    )

    expect(fbq).toHaveBeenCalledWith('init', 'pixel-1')
    expect(fbq).toHaveBeenCalledWith('track', 'PageView')
  })

  it('initializes the configured pixel through the standalone hook', async () => {
    const fbq = vi.fn()
    window.fbq = fbq
    const { useMetaPixel } = await import('../src')

    renderHook(() => useMetaPixel({
      pixelIds: 'pixel-1',
      enableLocalhost: true,
      loadMode: 'manual',
    }))

    expect(fbq).toHaveBeenCalledWith('init', 'pixel-1')
    expect(fbq).toHaveBeenCalledWith('track', 'PageView')
  })

  it('initializes the configured pixel through the direct helper', async () => {
    const fbq = vi.fn()
    window.fbq = fbq
    const { initMetaPixel } = await import('../src')

    initMetaPixel({
      pixelIds: 'pixel-1',
      enableLocalhost: true,
      loadMode: 'manual',
    })

    expect(fbq).toHaveBeenCalledWith('init', 'pixel-1')
    expect(fbq).toHaveBeenCalledWith('track', 'PageView')
  })
})
