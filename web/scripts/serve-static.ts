// ビルド済みの静的サイト（build/client）を配信する（E2E・Lighthouse 用。npm run serve:static -w web）
// 振り分けは Firebase Hosting に合わせる（scripts/staticRouting.ts）。ポートは環境変数 PORT（既定 4313）
import { existsSync, readFileSync, statSync } from 'node:fs'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import {
  cacheControlFor,
  contentTypeFor,
  isCompressible,
  resolveStaticRequest,
} from './staticRouting.ts'

const clientDir = join(import.meta.dirname, '../build/client')
const port = Number(process.env.PORT ?? 4313)

// トップと 404 ページが無ければ配信できないため、起動前に確かめる
const missing = ['index.html', '404.html'].filter((name) => !existsSync(join(clientDir, name)))
if (missing.length > 0) {
  console.error(
    `${clientDir} にビルド結果（${missing.join('・')}）がありません。先に npm run build を実行してください`,
  )
  process.exit(1)
}

const isFile = (relativePath: string) => {
  const absolute = join(clientDir, relativePath)
  return existsSync(absolute) && statSync(absolute).isFile()
}

function handleRequest(request: IncomingMessage, response: ServerResponse) {
  const { pathname } = new URL(request.url ?? '/', 'http://localhost')
  const resolution = resolveStaticRequest(pathname, isFile)

  if (resolution.type === 'redirect') {
    response.writeHead(resolution.status, { Location: resolution.location })
    response.end()
    return
  }

  const body = readFileSync(join(clientDir, resolution.path))
  const headers: Record<string, string> = {
    'Content-Type': contentTypeFor(resolution.path),
    'Cache-Control': cacheControlFor(resolution.path),
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    Vary: 'Accept-Encoding',
  }
  const acceptsGzip = /\bgzip\b/.test(request.headers['accept-encoding'] ?? '')
  const payload = acceptsGzip && isCompressible(resolution.path) ? gzipSync(body) : body
  if (payload !== body) headers['Content-Encoding'] = 'gzip'
  headers['Content-Length'] = String(payload.length)

  response.writeHead(resolution.status, headers)
  response.end(request.method === 'HEAD' ? undefined : payload)
}

// 読み込みの失敗などで 1 件の応答に失敗しても、サーバー全体（E2E・Lighthouse の実行）を止めない
const server = createServer((request, response) => {
  try {
    handleRequest(request, response)
  } catch (error: unknown) {
    console.error(`${request.url ?? ''} の配信に失敗しました`, error)
    if (!response.headersSent) response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Internal Server Error')
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`build/client を http://127.0.0.1:${port} で配信しています`)
})
