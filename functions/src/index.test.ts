import { describe, expect, it } from 'vitest'
import * as functions from './index'

// デプロイされる関数の一覧と設定。
// onCall は定義した時点の共通設定（setGlobalOptions）を読むため、共通設定が先に適用されていることを確かめる
describe('functions のエントリ', () => {
  it('submitInquiry だけを公開する', () => {
    expect(Object.keys(functions)).toEqual(['submitInquiry'])
  })

  it('submitInquiry は東京リージョン・インスタンス数の上限付きの callable 関数', () => {
    const endpoint = functions.submitInquiry.__endpoint
    expect(endpoint.region).toEqual(['asia-northeast1'])
    expect(endpoint.maxInstances).toBe(5)
    expect(endpoint.callableTrigger).toBeDefined()
  })
})
