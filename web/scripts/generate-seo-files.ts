// ビルド後（postbuild）に build/client へ sitemap.xml と robots.txt を書き出す
// インデックスの許可は、アプリのビルドと同じく VITE_ALLOW_INDEXING（環境変数または .env 系ファイル）で決める
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { loadEnv } from 'vite'
import { PAGES } from '../app/content/pages.ts'
import { SITE } from '../app/content/site.ts'
import { parseAllowIndexing } from '../app/lib/indexing.ts'
import { buildRobotsTxt, buildSitemapXml } from './seoFiles.ts'

const root = join(import.meta.dirname, '..')
const clientDir = join(root, 'build/client')
// react-router build の既定のモード（production）で .env 系ファイルを読む。process.env の値が優先される
// アプリ側（lib/seo.ts の import.meta.env）と同じモード・同じ web/ の .env を読む前提。ビルドのモードを変える場合はここも合わせる。
// 食い違った場合は verify-prerender.mjs が robots.txt と各ページの noindex を突き合わせてビルドを失敗させる
const env = loadEnv('production', root, 'VITE_')
const allowIndexing = parseAllowIndexing(env.VITE_ALLOW_INDEXING)

writeFileSync(join(clientDir, 'sitemap.xml'), buildSitemapXml(SITE.url, PAGES))
writeFileSync(join(clientDir, 'robots.txt'), buildRobotsTxt(SITE.url, allowIndexing))
console.log(
  `sitemap.xml（${PAGES.length} ページ）と robots.txt を作成しました（インデックス: ${allowIndexing ? '許可' : '禁止'}）`,
)
