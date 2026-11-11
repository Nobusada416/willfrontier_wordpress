import { defineConfig } from 'vitest/config'

// React Router の Vite プラグインはテストでは使わないため、vite.config.ts とは分ける
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['app/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
    css: false,
  },
})
