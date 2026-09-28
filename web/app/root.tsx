import type { ReactNode } from 'react'
import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse } from 'react-router'
import type { Route } from './+types/root'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { MAIN_CONTENT_ID, SkipLink } from './components/layout/SkipLink'
import './app.css'

// 日本語フォントは unicode-range で細かく分割されるため、自前配信だと @font-face 宣言だけで
// 数百 KB の CSS になる。ブラウザごとに最適化された CSS を返す Google Fonts から読み込む
export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&family=Zen+Maru+Gothic:wght@400;500;700;900&display=swap',
  },
]

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex min-h-screen flex-col">
        <SkipLink />
        <Header />
        {/* スキップリンクで移動したときにフォーカスを受けられるよう tabIndex={-1} を付ける */}
        <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 outline-hidden">
          {children}
        </main>
        <Footer />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

// 404 は routes/not-found.tsx で扱うため、ここに来るのは主に描画中の予期しないエラー
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const title = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : 'エラー'
  const message =
    isRouteErrorResponse(error) && error.status === 404
      ? 'お探しのページは見つかりませんでした。'
      : '予期しないエラーが発生しました。'

  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-2xl font-bold text-wf-navy">{title}</h1>
      <p className="mt-4">{message}</p>
    </div>
  )
}
