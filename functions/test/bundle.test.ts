import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { buildOptions } from '../esbuild.config.mjs'

// Firebase のデプロイは functions/ ディレクトリだけをアップロードして npm install するため、
// ワークスペースの @wf/shared は解決できない。バンドルに取り込まれていることを保証する
const bundle = async () => {
  const result = await build({
    ...buildOptions,
    entryPoints: [fileURLToPath(new URL('./fixtures/usesShared.ts', import.meta.url))],
    outfile: 'out.js',
    write: false,
  })
  // sourcemap も出力されるため、JS 本体を選ぶ
  const output = result.outputFiles.find((file) => file.path.endsWith('.js'))
  if (!output) throw new Error('バンドル結果がありません')
  return output.text
}

const importedModules = (code: string) =>
  [...code.matchAll(/from\s*["']([^"']+)["']/g)].map((match) => match[1])

describe('functions のバンドル設定', () => {
  it('@wf/shared と zod をバンドルに取り込み、import として残さない', async () => {
    const modules = importedModules(await bundle())
    expect(modules).not.toContain('@wf/shared')
    expect(modules.some((name) => name?.startsWith('zod'))).toBe(false)
  })

  it('firebase-functions と firebase-admin は外部依存として残す', async () => {
    const modules = importedModules(await bundle())
    expect(modules).toContain('firebase-functions/v2/https')
  })

  it('Cloud Functions の Node 22 ランタイム向けに ESM で出力する', () => {
    expect(buildOptions.platform).toBe('node')
    expect(buildOptions.format).toBe('esm')
    expect(buildOptions.target).toBe('node22')
  })
})
