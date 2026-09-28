import { describe, expect, it } from 'vitest'
import { readFirebaseSettings } from './firebase'

const env = {
  VITE_FIREBASE_API_KEY: 'api-key',
  VITE_FIREBASE_PROJECT_ID: 'willfrontier',
  VITE_FIREBASE_APP_ID: '1:123:web:abc',
  VITE_RECAPTCHA_SITE_KEY: 'site-key',
}

describe('readFirebaseSettings', () => {
  it('環境変数から Firebase の設定と reCAPTCHA のサイトキーを読む', () => {
    expect(readFirebaseSettings(env)).toEqual({
      config: {
        apiKey: 'api-key',
        projectId: 'willfrontier',
        appId: '1:123:web:abc',
        authDomain: 'willfrontier.firebaseapp.com',
      },
      recaptchaSiteKey: 'site-key',
      useEmulators: false,
    })
  })

  it('VITE_USE_FIREBASE_EMULATORS=true なら Emulator に接続する', () => {
    expect(readFirebaseSettings({ ...env, VITE_USE_FIREBASE_EMULATORS: 'true' }).useEmulators).toBe(
      true,
    )
  })

  it('Emulator では実プロジェクトの設定が無くても demo プロジェクトで動かす', () => {
    expect(readFirebaseSettings({ VITE_USE_FIREBASE_EMULATORS: 'true' })).toEqual({
      config: {
        apiKey: 'demo-api-key',
        projectId: 'demo-willfrontier',
        appId: 'demo-app-id',
        authDomain: 'demo-willfrontier.firebaseapp.com',
      },
      recaptchaSiteKey: undefined,
      useEmulators: true,
    })
  })

  it('本番向けに必要な設定が欠けていれば、欠けている変数名を挙げて失敗する', () => {
    expect(() => readFirebaseSettings({ VITE_FIREBASE_API_KEY: 'api-key' })).toThrow(
      /VITE_FIREBASE_PROJECT_ID.*VITE_FIREBASE_APP_ID.*VITE_RECAPTCHA_SITE_KEY/,
    )
  })
})
