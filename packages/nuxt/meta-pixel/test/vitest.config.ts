import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  define: {
    'import.meta.client': 'true',
  },
  resolve: {
    alias: {
      '#app': fileURLToPath(new URL('./mocks/nuxt-app.ts', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/*.spec.ts'],
  },
})
