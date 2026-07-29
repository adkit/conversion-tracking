import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { MetaPixelProvider, useMetaPixel } from '../src'

describe('useMetaPixel Hook', () => {
  beforeEach(() => {
    vi.stubGlobal('fbq', vi.fn())
  })

  it('returns Meta Pixel instance with all methods', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MetaPixelProvider pixelIds="test-id">{children}</MetaPixelProvider>
    )

    const { result } = renderHook(() => useMetaPixel(), { wrapper })

    expect(typeof result.current.track).toBe('function')
    expect(typeof result.current.trackCustom).toBe('function')
    expect(typeof result.current.isLoaded).toBe('function')
  })

  it('works in standalone mode without Provider', () => {
    const { result } = renderHook(() => useMetaPixel())

    expect(result.current).toBeDefined()
    expect(typeof result.current.track).toBe('function')
  })

  it('accepts config in standalone mode', () => {
    const { result } = renderHook(() =>
      useMetaPixel({ pixelIds: 'test-id', debug: true })
    )

    expect(result.current).toBeDefined()
  })
})
