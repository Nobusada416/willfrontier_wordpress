import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'
import { ADMIN_LAYOUT_FILE, ADMIN_PAGES, PAGES } from './content/pages'

// route() は先頭・末尾のスラッシュなしのパスを受け取るため除去する（'/mission/' → 'mission'）
const toRoutePath = (path: string) => path.replace(/^\/|\/$/g, '')

// ページ定義（content/pages.ts）からルートを生成する
export default [
  ...PAGES.map((page) =>
    page.path === '/' ? index(page.file) : route(toRoutePath(page.path), page.file),
  ),
  // 施工事例の管理画面。ログインの判定と管理画面の枠を共通のレイアウトで行う
  layout(
    ADMIN_LAYOUT_FILE,
    ADMIN_PAGES.map((page) => route(toRoutePath(page.path), page.file)),
  ),
  // どのページにも一致しない URL（プリレンダー時は '/404'）
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig
