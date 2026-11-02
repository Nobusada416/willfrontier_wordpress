import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, relative, sep } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// firebase.json の functions.ignore（デプロイ時にアップロードするソースから除くファイル）を確かめる
type FunctionsConfig = { source: string; ignore?: string[] }
type FirebaseJson = { functions: FunctionsConfig[] }

const firebaseJson = JSON.parse(
  readFileSync(join(import.meta.dirname, '../../firebase.json'), 'utf8'),
) as FirebaseJson
const functionsConfig = firebaseJson.functions.find((config) => config.source === 'functions')

// firebase-tools のソースの列挙（lib/fsAsync.js）。型定義が無いため使う部分だけ型を付ける
type ReaddirRecursive = (options: {
  path: string
  ignoreStrings: string[]
}) => Promise<{ name: string }[]>
const { readdirRecursive } = createRequire(import.meta.url)('firebase-tools/lib/fsAsync.js') as {
  readdirRecursive: ReaddirRecursive
}

// firebase-tools の lib/deploy/functions/prepareFunctionsUpload.js（packageSource）と同じ組み立て方。
// ignore を指定しないときの既定は ["node_modules", ".git"]。指定するとそれで置き換わり、
// firebase-debug のログと .runtimeconfig.json だけは常に足される（*.local は足されない）
const uploadIgnore = (config: FunctionsConfig) => [
  ...(config.ignore ?? ['node_modules', '.git']),
  'firebase-debug.log',
  'firebase-debug.*.log',
  '.runtimeconfig.json',
]

// `firebase init functions` が firebase.json に書く既定の ignore（lib/init/features/functions/index.js）
const INIT_DEFAULT_IGNORE = [
  'node_modules',
  '.git',
  'firebase-debug.log',
  'firebase-debug.*.log',
  '*.local',
]

describe('Functions のアップロード対象（firebase.json の functions.ignore）', () => {
  let sourceDir = ''

  // functions/ と同じ構成の仮のディレクトリ（ビルド後・Emulator 用のローカル設定あり）
  const FILES = [
    'package.json',
    'lib/index.js',
    'lib/index.js.map',
    'src/index.ts',
    'test/bundle.test.ts',
    'esbuild.config.mjs',
    'tsconfig.json',
    'vitest.config.ts',
    '.gitignore',
    '.env.local',
    '.secret.local',
    'firebase-debug.log',
    'firebase-debug.1.log',
    '.git/HEAD',
    'node_modules/firebase-functions/package.json',
  ]

  beforeAll(() => {
    sourceDir = mkdtempSync(join(tmpdir(), 'wf-functions-upload-'))
    for (const file of FILES) {
      const path = join(sourceDir, file)
      mkdirSync(dirname(path), { recursive: true })
      writeFileSync(path, '')
    }
  })

  afterAll(() => {
    rmSync(sourceDir, { recursive: true, force: true })
  })

  const uploadedFiles = async () => {
    if (!functionsConfig) throw new Error('firebase.json に functions の設定がありません')
    const files = await readdirRecursive({
      path: sourceDir,
      ignoreStrings: uploadIgnore(functionsConfig),
    })
    return files.map((file) => relative(sourceDir, file.name).split(sep).join('/')).sort()
  }

  it('ignore を指定しているため、firebase init の既定の除外をすべて含める', () => {
    expect(functionsConfig?.ignore).toEqual(expect.arrayContaining(INIT_DEFAULT_IGNORE))
  })

  it('Emulator 用のローカルの秘密情報（.env.local・.secret.local）をアップロードしない', async () => {
    const files = await uploadedFiles()
    expect(files).not.toContain('.env.local')
    expect(files).not.toContain('.secret.local')
  })

  it('アップロードするのはビルド結果と package.json だけ', async () => {
    expect(await uploadedFiles()).toEqual(['lib/index.js', 'lib/index.js.map', 'package.json'])
  })
})
