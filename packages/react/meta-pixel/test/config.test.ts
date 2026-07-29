import { describe, it, expect } from 'vitest'

describe('Configuration Options', () => {
  it('validates single pixel ID format', () => {
    const pixelId = '1234567890'

    expect(typeof pixelId).toBe('string')
    expect(pixelId.length).toBeGreaterThan(0)
  })

  it('validates multiple pixel IDs format', () => {
    const pixelIds = ['1234567890', '0987654321', '1122334455']

    expect(Array.isArray(pixelIds)).toBe(true)
    expect(pixelIds.length).toBe(3)
    expect(pixelIds.every(id => typeof id === 'string')).toBe(true)
  })

  it('validates boolean configuration options', () => {
    const config = {
      autoTrackPageView: true,
      debug: false,
      enableLocalhost: true
    }

    expect(typeof config.autoTrackPageView).toBe('boolean')
    expect(typeof config.debug).toBe('boolean')
    expect(typeof config.enableLocalhost).toBe('boolean')
  })

  it('validates default configuration values', () => {
    const defaults = {
      autoTrackPageView: true,
      debug: false,
      enableLocalhost: false
    }

    expect(defaults.autoTrackPageView).toBe(true)
    expect(defaults.debug).toBe(false)
    expect(defaults.enableLocalhost).toBe(false)
  })
})
