import { afterEach, describe, expect, it, vi } from 'vitest'
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

describe('loadInquiryCallable', () => {
  afterEach(() => {
    vi.doUnmock('firebase/app')
    vi.doUnmock('firebase/functions')
    vi.doUnmock('firebase/app-check')
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('初期化の途中で失敗しても、次の呼び出しでは作成済みのアプリを使い回してやり直せる', async () => {
    vi.stubEnv('VITE_USE_FIREBASE_EMULATORS', 'true')
    vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', 'site-key')
    const apps: object[] = []
    const initializeApp = vi.fn(() => {
      // 実際の SDK と同じく、同じ名前のアプリを 2 回作ると失敗する
      if (apps.length > 0) throw new Error('duplicate-app')
      const app = {}
      apps.push(app)
      return app
    })
    vi.doMock('firebase/app', () => ({
      initializeApp,
      getApps: () => apps,
    }))
    const initializeAppCheck = vi
      .fn()
      .mockImplementationOnce(() => {
        throw new Error('reCAPTCHA を読み込めません')
      })
      .mockImplementation(() => ({}))
    vi.doMock('firebase/app-check', () => ({
      initializeAppCheck,
      ReCaptchaV3Provider: vi.fn(),
    }))
    const callable = vi.fn().mockResolvedValue({ data: { ok: true } })
    vi.doMock('firebase/functions', () => ({
      getFunctions: () => ({}),
      connectFunctionsEmulator: vi.fn(),
      httpsCallable: () => callable,
    }))
    const { loadInquiryCallable } = await import('./firebase')

    await expect(loadInquiryCallable()).rejects.toThrow('reCAPTCHA を読み込めません')
    const call = await loadInquiryCallable()
    await call({
      formType: 'contact',
      company: '',
      name: '田中',
      tel: '045-123-4567',
      message: 'a',
    })

    expect(initializeApp).toHaveBeenCalledTimes(1)
    expect(callable).toHaveBeenCalledTimes(1)
  })
})
