import { describe, expect, it } from 'vitest'
import {
  cacheControlFor,
  contentTypeFor,
  isCompressible,
  resolveStaticRequest,
} from './staticRouting'

// build/client にあるものとして扱うファイル
const FILES = new Set([
  'index.html',
  'mission/index.html',
  'contact/index.html',
  '404.html',
  'assets/root-abc.js',
  'media/photos/small/wf-001.webp',
  'robots.txt',
])
const exists = (path: string) => FILES.has(path)

describe('resolveStaticRequest', () => {
  it('トップは index.html を返す', () => {
    expect(resolveStaticRequest('/', exists)).toEqual({
      type: 'file',
      path: 'index.html',
      status: 200,
    })
  })

  it('末尾スラッシュ付きのページはディレクトリの index.html を返す', () => {
    expect(resolveStaticRequest('/mission/', exists)).toEqual({
      type: 'file',
      path: 'mission/index.html',
      status: 200,
    })
  })

  it('末尾スラッシュなしのページは付きの URL へ 301 する（trailingSlash: true）', () => {
    expect(resolveStaticRequest('/mission', exists)).toEqual({
      type: 'redirect',
      location: '/mission/',
      status: 301,
    })
  })

  it('旧 URL の /company/ は /mission/ へ 301 する（firebase.json の redirects）', () => {
    expect(resolveStaticRequest('/company/', exists)).toEqual({
      type: 'redirect',
      location: '/mission/',
      status: 301,
    })
    expect(resolveStaticRequest('/company/about', exists)).toEqual({
      type: 'redirect',
      location: '/mission/',
      status: 301,
    })
  })

  it('アセットはそのまま返す', () => {
    expect(resolveStaticRequest('/assets/root-abc.js', exists)).toEqual({
      type: 'file',
      path: 'assets/root-abc.js',
      status: 200,
    })
  })

  it('存在しない URL は 404.html を 404 で返す', () => {
    expect(resolveStaticRequest('/no-such-page/', exists)).toEqual({
      type: 'file',
      path: '404.html',
      status: 404,
    })
    expect(resolveStaticRequest('/assets/missing.js', exists)).toEqual({
      type: 'file',
      path: '404.html',
      status: 404,
    })
  })

  it('build/client の外を指すパスは 404 にする', () => {
    expect(resolveStaticRequest('/../package.json', exists)).toEqual({
      type: 'file',
      path: '404.html',
      status: 404,
    })
    expect(resolveStaticRequest('/%2e%2e/package.json', exists)).toEqual({
      type: 'file',
      path: '404.html',
      status: 404,
    })
  })

  it('URL エンコードされたパスを解釈する', () => {
    expect(resolveStaticRequest('/%6Dission/', exists)).toEqual({
      type: 'file',
      path: 'mission/index.html',
      status: 200,
    })
  })

  it('不正な URL エンコードは 404 にする', () => {
    expect(resolveStaticRequest('/%E0%A4%A/', exists)).toEqual({
      type: 'file',
      path: '404.html',
      status: 404,
    })
  })
})

describe('contentTypeFor', () => {
  it('拡張子から Content-Type を決める', () => {
    expect(contentTypeFor('index.html')).toBe('text/html; charset=utf-8')
    expect(contentTypeFor('assets/a.js')).toBe('text/javascript; charset=utf-8')
    expect(contentTypeFor('assets/a.css')).toBe('text/css; charset=utf-8')
    expect(contentTypeFor('media/a.webp')).toBe('image/webp')
    expect(contentTypeFor('media/a.mp4')).toBe('video/mp4')
  })

  it('不明な拡張子は application/octet-stream にする', () => {
    expect(contentTypeFor('a.unknown')).toBe('application/octet-stream')
  })
})

describe('isCompressible', () => {
  it('テキスト系だけを圧縮する', () => {
    expect(isCompressible('index.html')).toBe(true)
    expect(isCompressible('assets/a.js')).toBe(true)
    expect(isCompressible('media/images/logo.svg')).toBe(true)
    expect(isCompressible('media/a.webp')).toBe(false)
    expect(isCompressible('media/a.mp4')).toBe(false)
    expect(isCompressible('a.unknown')).toBe(false)
  })
})

describe('cacheControlFor', () => {
  it('firebase.json と同じキャッシュ方針にする', () => {
    expect(cacheControlFor('assets/a.js')).toBe('public, max-age=31536000, immutable')
    expect(cacheControlFor('media/photos/small/wf-001.webp')).toBe('public, max-age=604800')
    expect(cacheControlFor('mission/index.html')).toBe('no-cache')
    expect(cacheControlFor('404.html')).toBe('no-cache')
  })
})
