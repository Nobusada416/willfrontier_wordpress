import { test as base } from '@playwright/test'
import { stubEmptyCaseStudies } from './caseStudies'

// E2E の test。ビルドには本番の Firebase の設定（web/.env.production）が入るため、
// 施工事例の読み込みが本番の Firestore に届かないよう、どのテストでも 0 件の応答に差し替えてから始める
export const test = base.extend<{ stubFirestore: undefined }>({
  stubFirestore: [
    async ({ page }, use) => {
      await stubEmptyCaseStudies(page)
      await use(undefined)
    },
    { auto: true },
  ],
})

export { expect } from '@playwright/test'
