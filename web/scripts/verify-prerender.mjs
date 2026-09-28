// プリレンダー結果の検証（npm run build の直後に postbuild として実行）
// 各ページの HTML に <title> と <h1>（ページ本文の見出し）が含まれることを確認し、
// 中身の空の HTML（SPA の殻だけ）が出力される不具合を検出する
// あわせて 404.html が存在し、検索エンジンに登録されない（noindex）ことを確認する
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

const notFoundPage = join(clientDir, '404.html')
const pages = [...findHtml(clientDir), notFoundPage]
const broken = pages.filter((path) => {
  if (!existsSync(path)) return true
  const html = readFileSync(path, 'utf8')
  if (path === notFoundPage && !html.includes('content="noindex"')) return true
  return !/<title>[^<]+<\/title>/.test(html) || !html.includes('<h1')
})

if (pages.length === 0 || broken.length > 0) {
  console.error('プリレンダー結果に不備があるページがあります（ファイルがない・title や本文がない・404 に noindex がない）:')
  for (const path of broken) console.error(`  ${path}`)
  process.exit(1)
}
console.log(`プリレンダー結果を検証しました（${pages.length} ページ）`)
