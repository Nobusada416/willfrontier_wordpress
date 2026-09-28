// ビルド済みの静的サイト（build/client）を E2E・Lighthouse 用に配信するときの振り分け。
// 本番の Firebase Hosting（firebase.json の cleanUrls・trailingSlash・redirects・headers）と同じ応答にそろえる。
// vite preview は存在しない URL にも 200 でトップの HTML を返すため、404 ページや末尾スラッシュの確認に使えない

export type StaticResolution =
  | { type: 'file'; path: string; status: 200 | 404 }
  | { type: 'redirect'; location: string; status: 301 }

const NOT_FOUND: StaticResolution = { type: 'file', path: '404.html', status: 404 }

// firebase.json の redirects（/company{,/**} → /mission/）
const REDIRECTS: readonly { pattern: RegExp; location: string }[] = [
  { pattern: /^\/company(\/.*)?$/, location: '/mission/' },
]

function decodePath(pathname: string): string | undefined {
  try {
    return decodeURIComponent(pathname)
  } catch (error: unknown) {
    // 不正な % エンコード（URIError）は存在しない URL として扱う。それ以外は想定外のため投げ直す（呼び出し側で 500 にする）
    if (error instanceof URIError) return undefined
    throw error
  }
}

// pathname（クエリを除いた URL のパス）から、返すファイル（build/client からの相対パス）かリダイレクト先を決める
export function resolveStaticRequest(
  pathname: string,
  exists: (relativePath: string) => boolean,
): StaticResolution {
  const decoded = decodePath(pathname)
  if (decoded === undefined) return NOT_FOUND

  const segments = decoded.split('/').filter((segment) => segment !== '')
  // build/client の外を指すパス（..）や、隠しファイル（firebase.json の ignore: **/.*）は返さない
  if (segments.some((segment) => segment === '..' || segment.startsWith('.'))) return NOT_FOUND

  const redirect = REDIRECTS.find(({ pattern }) => pattern.test(decoded))
  if (redirect) return { type: 'redirect', location: redirect.location, status: 301 }

  const relative = segments.join('/')
  const indexPath = relative === '' ? 'index.html' : `${relative}/index.html`

  if (decoded.endsWith('/')) {
    return exists(indexPath) ? { type: 'file', path: indexPath, status: 200 } : NOT_FOUND
  }
  if (exists(relative)) return { type: 'file', path: relative, status: 200 }
  // trailingSlash: true により、ディレクトリのページは末尾スラッシュ付きの URL へ移す
  if (exists(indexPath)) return { type: 'redirect', location: `${decoded}/`, status: 301 }
  return NOT_FOUND
}

const CONTENT_TYPES: Readonly<Record<string, string>> = {
  html: 'text/html; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  css: 'text/css; charset=utf-8',
  json: 'application/json; charset=utf-8',
  txt: 'text/plain; charset=utf-8',
  xml: 'application/xml; charset=utf-8',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  ico: 'image/x-icon',
  mp4: 'video/mp4',
  woff2: 'font/woff2',
}

export function contentTypeFor(path: string): string {
  const extension = path.split('.').pop()?.toLowerCase() ?? ''
  return CONTENT_TYPES[extension] ?? 'application/octet-stream'
}

// 圧縮して返す種類（Firebase Hosting もテキスト系は圧縮して配信する）
export function isCompressible(path: string): boolean {
  const type = contentTypeFor(path)
  if (type === 'application/octet-stream') return false
  return type.startsWith('text/') || type.startsWith('application/') || type === 'image/svg+xml'
}

// firebase.json の headers の Cache-Control
export function cacheControlFor(path: string): string {
  if (path.startsWith('assets/')) return 'public, max-age=31536000, immutable'
  if (path.startsWith('media/')) return 'public, max-age=604800'
  return 'no-cache'
}
