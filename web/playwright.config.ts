import { defineConfig, devices } from '@playwright/test'

// E2E はビルド済みの静的サイト（build/client）に対して実行する。先に npm run build しておく
// 配信は Firebase Hosting と同じ振り分けの scripts/serve-static.ts（404.html・末尾スラッシュの 301 を再現）
const PORT = 4313
const BASE_URL = `http://127.0.0.1:${PORT}`
const isCI = Boolean(process.env.CI)

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run serve:static',
    url: `${BASE_URL}/`,
    env: { PORT: String(PORT) },
    reuseExistingServer: !isCI,
  },
})
