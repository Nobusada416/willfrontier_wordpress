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

  it('Google Fonts の CSS とフォントを許可する', () => {
    expect(csp.get('style-src')).toContain('https://fonts.googleapis.com')
    expect(csp.get('font-src')).toContain('https://fonts.gstatic.com')
  })

  it('App Check（reCAPTCHA v3）のスクリプトと iframe を許可する', () => {
    expect(csp.get('script-src')).toEqual(
      expect.arrayContaining([
        'https://www.google.com/recaptcha/',
        'https://www.gstatic.com/recaptcha/',
      ]),
    )
    expect(csp.get('frame-src')).toContain('https://www.google.com/recaptcha/')
  })

  it('送信処理（Cloud Functions）と App Check のトークン交換への通信を許可する', () => {
    expect(csp.get('connect-src')).toEqual(
      expect.arrayContaining([
        "'self'",
        // ワイルドカードは先頭のラベルにしか使えないため、リージョンまでは絞れない
        'https://*.cloudfunctions.net',
        'https://content-firebaseappcheck.googleapis.com',
      ]),
    )
  })

  it('写真・動画は同じオリジンから配信する（poster などの data: も許可）', () => {
    expect(csp.get('img-src')).toEqual(expect.arrayContaining(["'self'", 'data:']))
    expect(csp.get('media-src')).toEqual(["'self'"])
  })
})
