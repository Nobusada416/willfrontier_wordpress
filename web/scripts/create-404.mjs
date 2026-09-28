// プリレンダーした 404 ページ（build/client/404/index.html）を、
// Firebase Hosting が存在しない URL に返す build/client/404.html へ移す
// （/404/ という URL で 200 を返すページを残さないよう、コピーではなく移動する）
import { existsSync, renameSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const clientDir = fileURLToPath(new URL('../build/client', import.meta.url))
const source = `${clientDir}/404/index.html`

if (!existsSync(source)) {
  console.error(`404 ページのプリレンダー結果がありません: ${source}`)
  process.exit(1)
}
renameSync(source, `${clientDir}/404.html`)
rmSync(`${clientDir}/404`, { recursive: true })
console.log('404.html を作成しました')
