import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Firebase Hosting のレスポンスヘッダー（firebase.json）の設定を確かめる
type Header = { key: string; value: string }
type HeaderRule = { source?: string; regex?: string; headers: Header[] }
type FirebaseJson = { hosting: { headers: HeaderRule[] } }

const firebaseJson = JSON.parse(
  readFileSync(join(import.meta.dirname, '../../firebase.json'), 'utf8'),
) as FirebaseJson

const headerOf = (key: string) =>
  firebaseJson.hosting.headers
    .find((rule) => rule.source === '**')
    ?.headers.find((header) => header.key === key)?.value

// 「script-src 'self' https://…」のような CSP を、ディレクティブ名 → 値の一覧 にする
const parseCsp = (policy: string) =>
  new Map(
    policy
      .split(';')
      .map((directive) => directive.trim().split(/\s+/))
      .filter(([name]) => name)
      .map(([name = '', ...values]) => [name, values]),
  )

describe('Content-Security-Policy（Report-Only）', () => {
  const policy = headerOf('Content-Security-Policy-Report-Only')
  const csp = parseCsp(policy ?? '')

  it('まずは Report-Only で全ページに付ける（違反してもブロックせず、コンソールに報告する）', () => {
    expect(policy).toBeDefined()
    expect(headerOf('Content-Security-Policy')).toBeUndefined()
  })

  it('既定は同じオリジンだけを許可し、プラグイン・<base> の書き換え・ほかのサイトへの埋め込みを禁止する', () => {
    expect(csp.get('default-src')).toEqual(["'self'"])
    expect(csp.get('object-src')).toEqual(["'none'"])
    expect(csp.get('base-uri')).toEqual(["'self'"])
    expect(csp.get('frame-ancestors')).toEqual(["'none'"])
    expect(csp.get('form-action')).toEqual(["'self'"])
  })

  // 外部のオリジンを並べるディレクティブは完全に一致させ、意図しない許可の追加を検知する
  const sorted = (name: string) => [...(csp.get(name) ?? [])].sort()

  it('スクリプトは自サイト・インライン（プリレンダーの hydration 用）・reCAPTCHA（App Check）だけ', () => {
    expect(sorted('script-src')).toEqual(
      [
        "'self'",
        "'unsafe-inline'",
        'https://www.google.com/recaptcha/',
        'https://www.gstatic.com/recaptcha/',
      ].sort(),
    )
  })

  it('スタイルとフォントは自サイトと Google Fonts だけ', () => {
    expect(sorted('style-src')).toEqual(
      ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'].sort(),
    )
    expect(sorted('font-src')).toEqual(["'self'", 'https://fonts.gstatic.com'].sort())
  })

  it('通信は送信処理（Cloud Functions）・App Check のトークン交換・reCAPTCHA だけ', () => {
    expect(sorted('connect-src')).toEqual(
      [
        "'self'",
        // ワイルドカードは先頭のラベルにしか使えないため、リージョンまでは絞れない（P10 でプロジェクト ID に絞る）
        'https://*.cloudfunctions.net',
        'https://content-firebaseappcheck.googleapis.com',
        'https://www.google.com/recaptcha/',
      ].sort(),
    )
  })

  it('iframe は reCAPTCHA だけ', () => {
    expect(csp.get('frame-src')).toEqual(['https://www.google.com/recaptcha/'])
  })

  it('写真・動画は同じオリジンから配信する（reCAPTCHA の画像を除く）', () => {
    expect(sorted('img-src')).toEqual(["'self'", 'https://www.gstatic.com/recaptcha/'].sort())
    expect(csp.get('media-src')).toEqual(["'self'"])
  })
})
