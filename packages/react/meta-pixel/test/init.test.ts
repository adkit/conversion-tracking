import { describe, it, expect, beforeEach, vi } from 'vitest'
import { initMetaPixel } from '../src'

describe('initMetaPixel', () => {
  beforeEach(() => {
    vi.stubGlobal('fbq', vi.fn())
  })

  it('initializes with single pixel ID', () => {
    expect(() => {
      initMetaPixel({ pixelIds: 'test-id' })
    }).not.toThrow()
  })

  it('initializes with multiple pixel IDs', () => {
    expect(() => {
      initMetaPixel({ pixelIds: ['id-1', 'id-2', 'id-3'] })
    }).not.toThrow()
  })

  it('accepts all configuration options', () => {
    expect(() => {
      initMetaPixel({
        pixelIds: 'test-id',
        autoTrackPageView: false,
        debug: true,
        enableLocalhost: true
      })
    }).not.toThrow()
  })

  it('handles multiple calls gracefully', () => {
    initMetaPixel({ pixelIds: 'id-1' })

    expect(() => {
      initMetaPixel({ pixelIds: 'id-2' })
    }).not.toThrow()
  })
})
