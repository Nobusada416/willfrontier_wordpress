import { defineConfig } from 'vitest/config'

// Functions・Firestore の Emulator を使った結合テスト（npm run test:integration）
export default defineConfig({
  test: {
    include: ['tests/integration/**/*.test.ts'],
    environment: 'node',
    // 同じ Emulator のデータを使うため直列に実行する
    fileParallelism: false,
    // 最初の呼び出しは関数の読み込みを待つため長めにする
    testTimeout: 30000,
    hookTimeout: 30000,
  },
})
