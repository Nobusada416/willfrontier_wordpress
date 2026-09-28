// プリレンダー結果の検証（npm run build の直後に postbuild として実行）
// 各ページの HTML に <title> と <main> が含まれることを確認し、
// 中身の空の HTML（SPA の殻だけ）が出力される不具合を検出する
import { readdirSync, readFileSync, statSync } from 'node:fs'
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

const pages = findHtml(clientDir)
const broken = pages.filter((path) => {
  const html = readFileSync(path, 'utf8')
  return !/<title>[^<]+<\/title>/.test(html) || !html.includes('<main')
})

if (pages.length === 0 || broken.length > 0) {
  console.error('プリレンダー結果に title または本文がないページがあります:')
  for (const path of broken) console.error(`  ${path}`)
  process.exit(1)
}
console.log(`プリレンダー結果を検証しました（${pages.length} ページ）`)
