// プリレンダー結果の検証（npm run build の直後に postbuild として実行）
// - 各ページの HTML に <title> と <h1>（ページ本文の見出し）が含まれること
//   （中身の空の HTML（SPA の殻だけ）が出力される不具合を検出する）
// - 各ページに canonical と og:image があり、og:image の画像がビルド結果に含まれること
// - 404.html が存在し、検索エンジンに登録されない（noindex）こと
// - sitemap.xml が全ページの canonical を過不足なく含むこと
// - robots.txt とページの noindex が同じ方針であること（禁止なら全ページ noindex、許可なら noindex なし＋Sitemap 行）
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const clientDir = fileURLToPath(new URL('../build/client', import.meta.url))

/** @param {string} dir @returns {string[]} */
const findHtml = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return name === 'assets' ? [] : findHtml(path)
    return name === 'index.html' ? [path] : []
  })

/** @param {string} path @returns {string} */
const readOrEmpty = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : '')

/** @param {string} html @param {RegExp} pattern @returns {string | undefined} */
const capture = (html, pattern) => pattern.exec(html)?.[1]

const NOINDEX = /<meta name="robots" content="noindex"\/?>/

/** @type {string[]} */
const errors = []
const pages = findHtml(clientDir)
if (pages.length === 0) errors.push('ページの HTML が 1 つもありません')

const robots = readOrEmpty(join(clientDir, 'robots.txt'))
if (!robots) errors.push('robots.txt がありません')
const indexingAllowed = !/^Disallow: \/$/m.test(robots)
if (robots && indexingAllowed && !/^Sitemap: https:\/\/\S+\/sitemap\.xml$/m.test(robots)) {
  errors.push('robots.txt でクロールを許可しているのに Sitemap 行がありません')
}

/** @type {string[]} */
const canonicals = []
for (const path of pages) {
  const html = readFileSync(path, 'utf8')
  if (!/<title>[^<]+<\/title>/.test(html) || !html.includes('<h1')) {
    errors.push(`title または本文（h1）がありません: ${path}`)
  }
  const canonical = capture(html, /<link rel="canonical" href="([^"]+)"/)
  if (canonical) canonicals.push(canonical)
  else errors.push(`canonical がありません: ${path}`)

  const ogImage = capture(html, /<meta property="og:image" content="([^"]+)"/)
  if (!ogImage) errors.push(`og:image がありません: ${path}`)
  else if (!URL.canParse(ogImage)) {
    errors.push(`og:image が絶対 URL ではありません（${ogImage}）: ${path}`)
  } else if (!existsSync(join(clientDir, new URL(ogImage).pathname))) {
    errors.push(`og:image の画像がビルド結果にありません（${ogImage}）: ${path}`)
  }

  if (NOINDEX.test(html) === indexingAllowed) {
    errors.push(
      `robots.txt（${indexingAllowed ? '許可' : '禁止'}）と noindex の有無が一致しません: ${path}`,
    )
  }
}

const notFoundPage = join(clientDir, '404.html')
if (!NOINDEX.test(readOrEmpty(notFoundPage))) {
  errors.push(`404.html がない、または noindex がありません: ${notFoundPage}`)
}

const sitemap = readOrEmpty(join(clientDir, 'sitemap.xml'))
if (!sitemap) errors.push('sitemap.xml がありません')
const locs = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), (match) =>
  (match[1] ?? '').replaceAll('&amp;', '&'),
)
const missing = canonicals.filter((url) => !locs.includes(url))
const extra = locs.filter((url) => !canonicals.includes(url))
if (sitemap && (missing.length > 0 || extra.length > 0)) {
  errors.push(
    `sitemap.xml とページの canonical が一致しません（不足: ${missing.join(', ') || 'なし'} / 余分: ${extra.join(', ') || 'なし'}）`,
  )
}

if (errors.length > 0) {
  console.error('プリレンダー結果に不備があります:')
  for (const error of errors) console.error(`  ${error}`)
  process.exit(1)
}
console.log(
  `プリレンダー結果を検証しました（${pages.length} ページ＋404.html・sitemap.xml・robots.txt。インデックス: ${indexingAllowed ? '許可' : '禁止'}）`,
)
