import { render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MetaPixelProvider } from '../src'

const metaPixel = vi.hoisted(() => ({
  init: vi.fn(),
  isLoaded: vi.fn(() => false),
  isInitialized: vi.fn(() => false),
  load: vi.fn(),
  track: vi.fn(),
  trackCustom: vi.fn(),
}))

vi.mock('@adkit/meta-pixel', () => ({
  default: metaPixel,
}))

describe('MetaPixelProvider loading mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    metaPixel.isLoaded.mockReturnValue(false)
    metaPixel.isInitialized.mockReturnValue(false)
  })

  it('forwards manual loading to the core Meta Pixel client', async () => {
    render(
      <MetaPixelProvider pixelIds="test-id" loadMode="manual">
        <div />
      </MetaPixelProvider>,
    )

    await waitFor(() => {
      expect(metaPixel.init).toHaveBeenCalledWith({
        pixelIds: 'test-id',
        autoTrackPageView: true,
        debug: false,
        enableLocalhost: false,
        loadMode: 'manual',
      })
    })
  })
})
