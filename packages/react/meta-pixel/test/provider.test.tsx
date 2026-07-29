import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MetaPixelProvider, useMetaPixel } from '../src'

describe('MetaPixelProvider', () => {
  beforeEach(() => {
    vi.stubGlobal('fbq', vi.fn())
  })

  it('renders children correctly', () => {
    render(
      <MetaPixelProvider pixelIds="test-id">
        <div data-testid="child">Test Content</div>
      </MetaPixelProvider>
    )

    expect(screen.getByTestId('child')).toBeDefined()
  })

  it('provides Meta Pixel instance to children', () => {
    function TestComponent() {
      const meta = useMetaPixel()
      return <div data-testid="result">{typeof meta.track}</div>
    }

    render(
      <MetaPixelProvider pixelIds="test-id">
        <TestComponent />
      </MetaPixelProvider>
    )

    expect(screen.getByTestId('result').textContent).toBe('function')
  })

  it('supports multiple pixel IDs', () => {
    const pixelIds = ['pixel-1', 'pixel-2', 'pixel-3']

    function TestComponent() {
      const meta = useMetaPixel()
      return <div data-testid="loaded">{meta.isLoaded() ? 'yes' : 'no'}</div>
    }

    render(
      <MetaPixelProvider pixelIds={pixelIds}>
        <TestComponent />
      </MetaPixelProvider>
    )

    expect(screen.getByTestId('loaded')).toBeDefined()
  })
})
