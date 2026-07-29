// Main component - drop-in for Next.js
export { MetaPixel } from './MetaPixel';
export type { MetaPixelProps } from './MetaPixel';

// Re-export from React package for manual tracking
export { useMetaPixel, MetaPixelProvider, initMetaPixel } from '@adkit/meta-pixel-react';

// Re-export types
export type { StandardEvent, EventData, EventMetaData, MetaPixelConfig, MetaPixelInterface, MetaPixelLoadMode } from '@adkit/meta-pixel-react';
