// Cloud Functions のビルド設定
// Firebase のデプロイは functions/ だけをアップロードして npm install するため、
// ワークスペースの @wf/shared（と zod）は 1 ファイルにバンドルして取り込む。
// firebase-functions / firebase-admin は package.json の dependencies としてデプロイ先でインストールされる
import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'

/** @param {string} path */
const here = (path) => fileURLToPath(new URL(path, import.meta.url))

/** @type {import('esbuild').BuildOptions & { platform: 'node', format: 'esm', target: 'node22' }} */
export const buildOptions = {
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  sourcemap: true,
  // @wf/shared は tsconfig の paths で ../shared/src を参照する
  tsconfig: here('./tsconfig.json'),
  external: ['firebase-functions', 'firebase-admin'],
  logLevel: 'info',
}

// `node esbuild.config.mjs` で直接実行されたときだけビルドする（テストからの import では実行しない）
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await build({
    ...buildOptions,
    entryPoints: [here('./src/index.ts')],
    outfile: here('./lib/index.js'),
  })
}
