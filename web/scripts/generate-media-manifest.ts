// 使い方: npm run media:manifest -w web（写真・動画を追加・差し替えたときに実行する）
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildMediaManifest } from './mediaManifest.ts'

const root = join(import.meta.dirname, '..')
const manifest = buildMediaManifest(join(root, 'public'))
writeFileSync(join(root, 'app/lib/mediaManifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log(
  `寸法一覧を更新しました（写真 ${Object.keys(manifest.photos).length} 件・poster ${Object.keys(manifest.posters).length} 件）`,
)
