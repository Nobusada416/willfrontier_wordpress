import { describe, expect, it } from 'vitest'
import {
  firebaseStorageBucket,
  missingFirebaseEnv,
  REQUIRED_FIREBASE_ENV,
  usesFirebaseEmulators,
} from './firebaseEnv'

const env = {
  VITE_FIREBASE_API_KEY: 'api-key',
  VITE_FIREBASE_PROJECT_ID: 'willfrontier',
  VITE_FIREBASE_APP_ID: '1:123:web:abc',
  VITE_RECAPTCHA_SITE_KEY: 'site-key',
}

describe('REQUIRED_FIREBASE_ENV', () => {
  it('Firebase の Web アプリ設定と reCAPTCHA のサイトキーを必須とする', () => {
    expect(REQUIRED_FIREBASE_ENV).toEqual([
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_APP_ID',
      'VITE_RECAPTCHA_SITE_KEY',
    ])
  })
})

describe('missingFirebaseEnv', () => {
  it('すべてそろっていれば空の一覧を返す', () => {
    expect(missingFirebaseEnv(env)).toEqual([])
  })

  it('未設定の変数名を必須の順に返す', () => {
    expect(missingFirebaseEnv({ VITE_FIREBASE_PROJECT_ID: 'willfrontier' })).toEqual([
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_APP_ID',
      'VITE_RECAPTCHA_SITE_KEY',
    ])
  })

  it('空文字や空白だけの値も未設定として扱う', () => {
    expect(
      missingFirebaseEnv({ ...env, VITE_FIREBASE_API_KEY: '', VITE_RECAPTCHA_SITE_KEY: '  ' }),
    ).toEqual(['VITE_FIREBASE_API_KEY', 'VITE_RECAPTCHA_SITE_KEY'])
  })
})

describe('usesFirebaseEmulators', () => {
  it("VITE_USE_FIREBASE_EMULATORS が 'true' のときだけ Emulator に接続する", () => {
    expect(usesFirebaseEmulators({ VITE_USE_FIREBASE_EMULATORS: 'true' })).toBe(true)
    expect(usesFirebaseEmulators({ VITE_USE_FIREBASE_EMULATORS: 'TRUE' })).toBe(false)
    expect(usesFirebaseEmulators({ VITE_USE_FIREBASE_EMULATORS: '1' })).toBe(false)
    expect(usesFirebaseEmulators({})).toBe(false)
  })
})

describe('firebaseStorageBucket', () => {
  it('VITE_FIREBASE_STORAGE_BUCKET があればその値（前後の空白を除く）を使う', () => {
    expect(
      firebaseStorageBucket({ VITE_FIREBASE_STORAGE_BUCKET: ' willfrontier.appspot.com ' }, 'p'),
    ).toBe('willfrontier.appspot.com')
  })

  it('無い・空ならプロジェクトの既定のバケット（<projectId>.firebasestorage.app）', () => {
    expect(firebaseStorageBucket({}, 'willfrontier')).toBe('willfrontier.firebasestorage.app')
    expect(firebaseStorageBucket({ VITE_FIREBASE_STORAGE_BUCKET: ' ' }, 'willfrontier')).toBe(
      'willfrontier.firebasestorage.app',
    )
  })
})
