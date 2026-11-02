import { defineConfig, devices } from '@playwright/test'

// 施工事例の管理画面の E2E（e2e/admin/）。Firebase の Emulator（Auth・Firestore・Storage）につないで動かす。
// ルートの npm run e2e:admin が Emulator を起動してからこの設定で実行する（docs/development.md）。
// 公開ページの E2E（playwright.config.ts）はビルド済みの静的サイトに対して実行するが、
// 管理画面は Emulator につなぐビルド（VITE_USE_FIREBASE_EMULATORS=true）が要るため、開発サーバーで配信する
// （本番向けのビルドを上書きしないため）
const PORT = 4314
const BASE_URL = `http://127.0.0.1:${PORT}`
const isCI = Boolean(process.env.CI)

export default defineConfig({
  testDir: './e2e/admin',
  // 同じ Emulator のデータを使うため直列に実行する
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : 'list',
  // 開発サーバーの初回の変換と Emulator への書き込みを待つため長めにする
  timeout: 90_000,
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx react-router dev --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `${BASE_URL}/admin/`,
    env: { VITE_USE_FIREBASE_EMULATORS: 'true' },
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
})
