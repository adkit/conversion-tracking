import { describe, expect, it, vi } from 'vitest'
import type { ModuleOptions, MetaPixelPublicRuntimeConfig } from '../src/module'
import moduleEntry from '../src/module'

vi.mock('@nuxt/kit', () => ({
  addImports: vi.fn(),
  addPlugin: vi.fn(),
  createResolver: vi.fn(() => ({ resolve: (path: string) => path })),
  defineNuxtModule: vi.fn((definition: unknown) => definition),
}))

interface TestModuleDefinition {
  defaults: ModuleOptions
  setup(options: ModuleOptions, nuxt: {
    options: {
      runtimeConfig: {
        public: Record<string, unknown>
      }
    }
  }): void
}

const moduleDefinition = moduleEntry as unknown as TestModuleDefinition

describe('Meta Pixel Nuxt loading config', () => {
  it('keeps eager loading as the module default', () => {
    expect(moduleDefinition.defaults.loadMode).toBe('eager')
  })

  it('copies manual mode into public runtime config', () => {
    const publicRuntimeConfig: Record<string, unknown> = {}
    const nuxt = {
      options: {
        runtimeConfig: {
          public: publicRuntimeConfig,
        },
      },
    }

    moduleDefinition.setup({
      pixelIds: 'pixel-1',
      loadMode: 'manual',
    }, nuxt)

    const config = publicRuntimeConfig.metaPixel as MetaPixelPublicRuntimeConfig
    expect(config.loadMode).toBe('manual')
  })
})
