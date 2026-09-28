import { type RouteConfig, index, route } from '@react-router/dev/routes'
import { PAGES } from './content/pages'

// ページ定義（content/pages.ts）からルートを生成する
// route() は先頭・末尾のスラッシュなしのパスを受け取るため除去する（'/mission/' → 'mission'）
export default PAGES.map((page) =>
  page.path === '/' ? index(page.file) : route(page.path.replace(/^\/|\/$/g, ''), page.file),
) satisfies RouteConfig
