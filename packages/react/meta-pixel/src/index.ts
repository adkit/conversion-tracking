// Primary API (Recommended - Simple & Clean)
export { useMetaPixel } from './useMetaPixel'
export { initMetaPixel } from './init'

// Alternative API (For those who prefer Provider pattern)
export { MetaPixelProvider } from './MetaPixelProvider'
export type { MetaPixelProviderProps } from './MetaPixelProvider'

// Re-export types from @adkit/meta-pixel for convenience
export type {
  StandardEvent,
  EventData,
  EventMetaData,
  MetaPixelConfig,
  MetaPixelInterface,
  MetaPixelLoadMode,
} from '@adkit/meta-pixel'
