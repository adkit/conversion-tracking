import { beforeEach, describe, expect, it, vi } from 'vitest'
import { navigateInNuxtAppTest, setNuxtAppTestState } from './mocks/nuxt-app'
import plugin from '../src/runtime/plugin'

const metaTestState = vi.hoisted(() => ({
  loaded: false,
  initialized: false,
  init: vi.fn(),
  load: vi.fn(),
  track: vi.fn(),
  trackCustom: vi.fn(),
  isLoaded: vi.fn(() => false),
  isInitialized: vi.fn(() => false),
}))

vi.mock('@adkit/meta-pixel', () => ({
  default: {
    init: metaTestState.init,
    load: metaTestState.load,
    track: metaTestState.track,
    trackCustom: metaTestState.trackCustom,
    isLoaded: metaTestState.isLoaded,
    isInitialized: metaTestState.isInitialized,
  },
}))

beforeEach(() => {
  metaTestState.loaded = false
  metaTestState.initialized = false
  metaTestState.init.mockReset()
  metaTestState.load.mockReset()
  metaTestState.track.mockReset()
  metaTestState.trackCustom.mockReset()
  metaTestState.isLoaded.mockReset()
  metaTestState.isLoaded.mockImplementation(() => metaTestState.loaded)
  metaTestState.isInitialized.mockReset()
  metaTestState.isInitialized.mockImplementation(() => metaTestState.initialized)
  metaTestState.init.mockImplementation(() => {
    metaTestState.loaded = true
    metaTestState.initialized = true
  })
})

describe('Meta Pixel Nuxt runtime loading', () => {
  it.each(['eager', 'lazy', 'manual'] as const)('forwards %s mode to the core package', (loadMode) => {
    setNuxtAppTestState({
      config: {
        public: {
          metaPixel: {
            pixelIds: 'pixel-1',
            autoTrackPageView: true,
            debug: false,
            enableLocalhost: true,
            loadMode,
            excludedRoutes: [],
            includedRoutes: [],
          },
        },
      },
    })

    ;(plugin as () => void)()

    expect(metaTestState.init).toHaveBeenCalledOnce()
    expect(metaTestState.init).toHaveBeenCalledWith(expect.objectContaining({ loadMode }))
    expect(metaTestState.load).not.toHaveBeenCalled()
  })

  it('initializes on the first allowed route and tracks later SPA pageviews once', () => {
    setNuxtAppTestState({
      config: {
        public: {
          metaPixel: {
            pixelIds: 'pixel-1',
            autoTrackPageView: true,
            debug: false,
            enableLocalhost: true,
            loadMode: 'manual',
            excludedRoutes: ['/private/**'],
            includedRoutes: [],
          },
        },
      },
      route: { path: '/private/start', meta: {} },
    })

    ;(plugin as () => void)()
    expect(metaTestState.init).not.toHaveBeenCalled()

    navigateInNuxtAppTest({ path: '/store', meta: {} })
    expect(metaTestState.init).toHaveBeenCalledOnce()

    navigateInNuxtAppTest({ path: '/checkout', meta: {} })
    expect(metaTestState.track).toHaveBeenCalledOnce()
    expect(metaTestState.track).toHaveBeenCalledWith('PageView')

    navigateInNuxtAppTest({ path: '/private/account', meta: {} })
    expect(metaTestState.track).toHaveBeenCalledOnce()
  })

  it('tracks one PageView when Nuxt replays the initial route', () => {
    setNuxtAppTestState({
      config: {
        public: {
          metaPixel: {
            pixelIds: 'pixel-1',
            autoTrackPageView: true,
            debug: false,
            enableLocalhost: true,
            loadMode: 'manual',
            excludedRoutes: [],
            includedRoutes: [],
          },
        },
      },
      route: { path: '/store', meta: {} },
    })

    ;(plugin as () => void)()
    expect(metaTestState.init).toHaveBeenCalledOnce()

    navigateInNuxtAppTest({ path: '/store', meta: {} })
    expect(metaTestState.track).not.toHaveBeenCalled()

    navigateInNuxtAppTest({ path: '/checkout', meta: {} })
    expect(metaTestState.track).toHaveBeenCalledOnce()
  })

  it('does not track a PageView for a navigation that failed', () => {
    setNuxtAppTestState({
      config: {
        public: {
          metaPixel: {
            pixelIds: 'pixel-1',
            autoTrackPageView: true,
            debug: false,
            enableLocalhost: true,
            loadMode: 'manual',
            excludedRoutes: [],
            includedRoutes: [],
          },
        },
      },
      route: { path: '/store', meta: {} },
    })

    ;(plugin as () => void)()

    navigateInNuxtAppTest({ path: '/checkout', meta: {} }, new Error('navigation aborted'))
    expect(metaTestState.track).not.toHaveBeenCalled()
  })


    metaTestState.loaded = true
    metaTestState.initialized = false
    setNuxtAppTestState({
      config: {
        public: {
          metaPixel: {
            pixelIds: 'pixel-1',
            autoTrackPageView: true,
            debug: false,
            enableLocalhost: true,
            loadMode: 'manual',
            excludedRoutes: [],
            includedRoutes: [],
          },
        },
      },
    })

    ;(plugin as () => void)()

    expect(metaTestState.init).toHaveBeenCalledOnce()
    expect(metaTestState.init).toHaveBeenCalledWith(expect.objectContaining({
      pixelIds: 'pixel-1',
    }))
  })
})
