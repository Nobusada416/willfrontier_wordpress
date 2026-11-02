import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// デプロイ用のビルド（firebase deploy の hosting の predeploy）で、フォームの送信に必要な
// Firebase の設定が欠けていれば失敗させる仕組みを確かめる
const webDir = join(import.meta.dirname, '..')
const script = join(import.meta.dirname, 'verify-deploy-env.ts')

type PackageJson = { scripts: Record<string, string> }
type FirebaseJson = { hosting: { predeploy: string[] } }

const webPackage = JSON.parse(readFileSync(join(webDir, 'package.json'), 'utf8')) as PackageJson
const firebaseJson = JSON.parse(
  readFileSync(join(webDir, '../firebase.json'), 'utf8'),
) as FirebaseJson

const FULL_ENV = {
  VITE_FIREBASE_API_KEY: 'dummy-api-key',
  VITE_FIREBASE_PROJECT_ID: 'dummy-project',
  VITE_FIREBASE_APP_ID: '1:000:web:dummy',
  VITE_RECAPTCHA_SITE_KEY: 'dummy-site-key',
  VITE_USE_FIREBASE_EMULATORS: '',
}

// web/.env.local など手元の .env 系ファイルに左右されないよう、確かめる変数はすべて明示的に渡す
// （Vite の loadEnv は process.env の値を .env 系ファイルより優先する。空文字も「渡した値」として優先される）
const runCheck = (env: Record<string, string>) =>
  spawnSync(process.execPath, ['--experimental-strip-types', '--no-warnings', script], {
    cwd: webDir,
    env: { PATH: process.env.PATH ?? '', ...env },
    encoding: 'utf8',
  })

describe('verify-deploy-env.ts', () => {
  it('4 つの設定がそろっていれば成功する', () => {
    const result = runCheck(FULL_ENV)
    expect(result.stderr).toBe('')
    expect(result.status).toBe(0)
  })

  it('設定が無ければ、欠けている変数名を挙げて失敗する', () => {
    const result = runCheck({
      ...FULL_ENV,
      VITE_FIREBASE_API_KEY: '',
      VITE_FIREBASE_APP_ID: '',
      VITE_RECAPTCHA_SITE_KEY: '',
    })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('VITE_FIREBASE_API_KEY')
    expect(result.stderr).toContain('VITE_FIREBASE_APP_ID')
    expect(result.stderr).toContain('VITE_RECAPTCHA_SITE_KEY')
    expect(result.stderr).not.toContain('VITE_FIREBASE_PROJECT_ID')
  })

  it('空白だけの値も欠けているものとして失敗する', () => {
    const result = runCheck({ ...FULL_ENV, VITE_FIREBASE_PROJECT_ID: '  ' })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('VITE_FIREBASE_PROJECT_ID')
  })

  it('Emulator 向けのビルド（VITE_USE_FIREBASE_EMULATORS=true）は確認の対象外', () => {
    const result = runCheck({
      VITE_FIREBASE_API_KEY: '',
      VITE_FIREBASE_PROJECT_ID: '',
      VITE_FIREBASE_APP_ID: '',
      VITE_RECAPTCHA_SITE_KEY: '',
      VITE_USE_FIREBASE_EMULATORS: 'true',
    })
    expect(result.status).toBe(0)
  })
})

describe('デプロイ用のビルドの配線', () => {
  it('build:deploy は設定を確かめてから通常のビルドを行う', () => {
    expect(webPackage.scripts['build:deploy']).toMatch(
      /^node .*scripts\/verify-deploy-env\.ts && npm run build$/,
    )
  })

  it('通常のビルド（npm run build・CI）は設定を確かめない', () => {
    const { build = '', postbuild = '' } = webPackage.scripts
    expect(`${build} ${postbuild}`).not.toContain('verify-deploy-env')
  })

  it('firebase deploy の hosting の predeploy はデプロイ用のビルドを使う', () => {
    expect(firebaseJson.hosting.predeploy).toEqual(['npm run build:deploy -w @wf/web'])
  })
})
