import type { Config } from '@react-router/dev/config'
import { prerenderPaths } from './app/content/pages'

export default {
  // SSR サーバーは持たず、全ページをビルド時に静的 HTML 化して Firebase Hosting で配信する
  ssr: false,
  prerender: prerenderPaths(),
} satisfies Config
