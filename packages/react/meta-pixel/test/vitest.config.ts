import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, '..'),
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['test/**/*.test.ts', 'test/**/*.test.tsx'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/*.spec.ts'],
    setupFiles: ['test/setup.ts'],
  },
})
