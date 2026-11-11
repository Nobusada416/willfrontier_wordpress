import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// P11 で WordPress の旧テーマを削除した。main（旧テーマ）の修正を取り込むときに
// 旧テーマのファイルが戻ってこないよう、リポジトリのルートに残っていないことを確かめる
const repoRoot = join(import.meta.dirname, '../..')

describe('旧テーマ（WordPress）のファイル', () => {
  it('ルート直下に PHP のテンプレートが無い', () => {
    expect(readdirSync(repoRoot).filter((name) => name.endsWith('.php'))).toEqual([])
  })

  it.each([
    'style.css',
    'tailwind.config.js',
    'src/input.css',
    'docker-compose.yml',
    'docker',
    'assets/js/animation.js',
    'scripts/build-static.sh',
    'scripts/build-all-static.sh',
    'scripts/run-all-patterns.sh',
    'scripts/generate-pdfs.js',
    'scripts/package.json',
  ])('%s が無い', (path) => {
    expect(existsSync(join(repoRoot, path))).toBe(false)
  })
})
