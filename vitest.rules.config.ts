import { defineConfig } from 'vitest/config'

// Firestore セキュリティルールのテスト。Emulator 上で実行する（npm run test:rules）
export default defineConfig({
  test: {
    include: ['tests/rules/**/*.test.ts'],
    environment: 'node',
    // Emulator へのアクセスがあるため直列に実行する
    fileParallelism: false,
    testTimeout: 15000,
  },
})
