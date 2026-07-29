import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['./src/index'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: false,
    esbuild: {
      jsx: 'automatic',
    },
    output: {
      // Preserve 'use client' directive at the top of the file
      banner: "'use client';\n",
    },
  },
  externals: ['react', 'react-dom', 'next', 'next/navigation', '@adkit/meta-pixel-react'],
})
