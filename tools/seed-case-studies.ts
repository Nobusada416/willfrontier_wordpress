// 旧サイトの施工事例 3 件（旧 page-casestudy.php・web/app/content/cases.ts の CASE_STUDIES）を、
// 管理画面で編集できるよう Firestore（caseStudies）と Storage（case-studies/）に入れる。
//
//   npm run seed:case-studies -- --emulator                         Emulator に入れる
//   npm run seed:case-studies -- --project <本番の ID>               本番に入れる（P10 の後に 1 回）
//   npm run seed:case-studies -- --project <本番の ID> --force       既にあっても上書きする（管理画面で直した内容は消える）
//   npm run seed:case-studies -- --project <本番の ID> --bucket <バケット>  バケットが <ID>.firebasestorage.app でないとき
//
// 旧データには日付・社名・分類（トップの一覧の tag）が無いため、仮の値（日付は実行日、社名は「[社名]」、分類は工事の種類から短く）を入れ、
// 3 件とも「下書き」で入れる。管理画面で日付・社名・分類を直してから公開してもらう（docs/case-studies.md）。
// ID は固定のため、何度実行しても重複しない。既にあれば上書きせずに止める（--force で上書き）。
// 本番では Application Default Credentials（gcloud auth application-default login）の権限で実行する
import { initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore, type Firestore } from 'firebase-admin/firestore'
import { getDownloadURL, getStorage } from 'firebase-admin/storage'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'
// Node（--experimental-strip-types）で読めるよう、import の無い定数のファイルだけを拡張子付きで読む
import {
  CASE_STUDIES_COLLECTION,
  CASE_STUDY_IMAGE_SIZES,
  CASE_STUDY_STORAGE_ROOT,
  caseStudyPhotoBasePath,
  caseStudyPhotoFilePath,
} from '../shared/src/caseStudies/constants.ts'

type Bucket = ReturnType<ReturnType<typeof getStorage>['bucket']>

export type LegacyCaseStudy = {
  // Firestore のドキュメントの ID（固定。再実行で重複させない）
  id: string
  title: string
  // 工事の種類・内容（旧データの meta。保存先は category）
  meta: string
  description: string
  // トップの一覧の分類（旧データに無いため meta から短く付けた仮の値）
  tag: string
  // web/public/media/photos/{small,large}/<slug>.webp。1 枚目がメイン
  photos: readonly [string, string, string, string]
}

// 旧サイトの主要施工事例（origin/migration/react-firebase の web/app/content/cases.ts の CASE_STUDIES と同じ内容）
export const LEGACY_CASE_STUDIES: readonly LegacyCaseStudy[] = [
  {
    id: 'legacy-01',
    title: '工場リノベーション廃材処理',
    meta: '産業廃棄物 / 金属類 / 機械設備',
    description:
      '稼働中の工場を一部解体し、設備更新に伴う大量の廃材を選別。再資源化率 92% を達成。',
    tag: '産業廃棄物',
    photos: ['wf-106', 'wf-107', 'wf-108', 'wf-109'],
  },
  {
    id: 'legacy-02',
    title: '大型工事現場での連続搬出',
    meta: '公共工事 / 大量運搬 / 安全管理',
    description:
      '都市部の再開発現場で連日大量に発生する廃材を、複数台体制で連続搬出。工程遅延ゼロで完遂。',
    tag: '公共工事',
    photos: ['wf-050', 'wf-048', 'wf-110', 'wf-111'],
  },
  {
    id: 'legacy-03',
    title: '広域運搬・回収実績',
    meta: '関東一円 / 定期回収 / 中継拠点活用',
    description: '複数拠点を持つお客様の廃材を、自社車両網で集約・効率搬送。月間稼働 600 件超。',
    tag: '定期回収',
    photos: ['wf-009', 'wf-049', 'wf-048', 'wf-037'],
  },
]

// 社名の仮の値（管理画面で直してもらう）
export const PLACEHOLDER_COMPANY = '[社名]'

// 管理画面の写真と同じ（ファイル名を変えずに上書きしないため長くキャッシュさせる）
const PHOTO_CACHE_CONTROL = 'public, max-age=31536000, immutable'
const UPDATED_BY = 'seed-case-studies'

// 日本時間の今日（YYYY-MM-DD）
export const todayInTokyo = (now = new Date()) =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(now)

type Manifest = { photos: Record<string, { large: { width: number; height: number } }> }

export type SeedOptions = {
  db: Firestore
  bucket: Bucket
  // リポジトリのルート（写真と mediaManifest.json を読む）
  root: string
  // 日付の仮の値（YYYY-MM-DD）
  today: string
  // 既にあっても上書きする
  force?: boolean
}

export class SeedExistsError extends Error {
  override name = 'SeedExistsError'
}

export const seedCaseStudies = async ({ db, bucket, root, today, force = false }: SeedOptions) => {
  const collection = db.collection(CASE_STUDIES_COLLECTION)
  const manifest = JSON.parse(
    readFileSync(resolve(root, 'web/app/lib/mediaManifest.json'), 'utf8'),
  ) as Manifest

  // 先にすべて確かめ、1 件でもあれば何も書かずに止める
  const existing: string[] = []
  for (const { id } of LEGACY_CASE_STUDIES) {
    if ((await collection.doc(id).get()).exists) existing.push(id)
  }
  if (existing.length > 0 && !force) {
    throw new SeedExistsError(
      `既に入っています: ${existing.join('・')}。管理画面で直した内容を消して入れ直すときは --force を付けてください`,
    )
  }

  const upload = async (storagePath: string, localPath: string) => {
    const file = bucket.file(storagePath)
    await file.save(readFileSync(localPath), {
      resumable: false,
      contentType: 'image/webp',
      metadata: {
        cacheControl: PHOTO_CACHE_CONTROL,
        // ダウンロード URL のトークン（管理画面の uploadBytes と同じく付ける）
        metadata: { firebaseStorageDownloadTokens: randomUUID() },
      },
    })
    return getDownloadURL(file)
  }

  const written: string[] = []
  for (const legacy of LEGACY_CASE_STUDIES) {
    // 上書きでは、管理画面で追加した写真なども含めて、この事例の写真を消してから入れ直す
    if (force) await bucket.deleteFiles({ prefix: `${CASE_STUDY_STORAGE_ROOT}/${legacy.id}/` })

    const photos = await Promise.all(
      legacy.photos.map(async (slug) => {
        const size = manifest.photos[slug]?.large
        if (!size) throw new Error(`mediaManifest.json に ${slug} の寸法がありません`)
        const basePath = caseStudyPhotoBasePath(legacy.id, slug, 'image/webp')
        const [smallUrl, largeUrl] = await Promise.all(
          CASE_STUDY_IMAGE_SIZES.map((imageSize) =>
            upload(
              caseStudyPhotoFilePath(basePath, imageSize),
              resolve(root, `web/public/media/photos/${imageSize}/${slug}.webp`),
            ),
          ),
        )
        // 旧サイトでも装飾として alt を空にしていた（公開サイトはタイトルなどから補う）
        return {
          path: basePath,
          smallUrl,
          largeUrl,
          width: size.width,
          height: size.height,
          alt: '',
        }
      }),
    )

    await collection.doc(legacy.id).set({
      status: 'draft',
      date: today,
      tag: legacy.tag,
      company: PLACEHOLDER_COMPANY,
      title: legacy.title,
      category: legacy.meta,
      description: legacy.description,
      photos,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: UPDATED_BY,
    })
    written.push(legacy.id)
  }
  return { written }
}

export type SeedTargetOptions = {
  // --project（省略時は環境変数・.firebaserc の default）
  project?: string
  // --emulator（firebase.json の Firestore・Storage の Emulator のポートにつなぐ）
  emulator?: boolean
  // --bucket（省略時は <プロジェクト ID>.firebasestorage.app）
  bucket?: string
  env: Record<string, string | undefined>
  // .firebaserc の中身
  firebaserc: string
  ports: { firestore: number; storage: number }
}

export type SeedTarget = {
  projectId: string
  bucket: string
  emulatorHosts: { firestore: string; storage: string } | undefined
}

// 接続先（プロジェクト・バケット・Emulator）を決める（tools/grant-admin.ts の resolveTarget と同じ流儀）
export const resolveSeedTarget = ({
  project,
  emulator = false,
  bucket,
  env,
  firebaserc,
  ports,
}: SeedTargetOptions): SeedTarget => {
  const defaultProject = (JSON.parse(firebaserc) as { projects?: { default?: string } }).projects
    ?.default
  const projectId = project ?? env.GOOGLE_CLOUD_PROJECT ?? env.GCLOUD_PROJECT ?? defaultProject
  if (!projectId) throw new Error('--project でプロジェクト ID を指定してください')

  const firestoreHost = emulator
    ? `127.0.0.1:${ports.firestore}`
    : env.FIRESTORE_EMULATOR_HOST || undefined
  const storageHost = emulator
    ? `127.0.0.1:${ports.storage}`
    : env.FIREBASE_STORAGE_EMULATOR_HOST || undefined
  if (Boolean(firestoreHost) !== Boolean(storageHost)) {
    throw new Error(
      'Firestore と Storage の片方だけが Emulator になっています。--emulator を付けるか、環境変数 FIRESTORE_EMULATOR_HOST・FIREBASE_STORAGE_EMULATOR_HOST をそろえてください',
    )
  }
  const emulatorHosts =
    firestoreHost && storageHost ? { firestore: firestoreHost, storage: storageHost } : undefined

  // demo- のプロジェクトは Emulator 専用（本番の Firebase には存在しない）
  if (!emulatorHosts && projectId.startsWith('demo-')) {
    throw new Error(
      `${projectId} は Emulator 専用のプロジェクトです。Emulator を起動して --emulator を付けるか、--project で本番のプロジェクトを指定してください`,
    )
  }
  return { projectId, bucket: bucket ?? `${projectId}.firebasestorage.app`, emulatorHosts }
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const USAGE = `使い方:
  npm run seed:case-studies -- [--emulator | --project <ID>] [--bucket <バケット>] [--force]`

const main = async () => {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      project: { type: 'string' },
      emulator: { type: 'boolean', default: false },
      bucket: { type: 'string' },
      force: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  })
  if (values.help || positionals.length > 0) {
    console.log(USAGE)
    process.exitCode = values.help ? 0 : 1
    return
  }

  const firebaseJson = JSON.parse(readFileSync(resolve(root, 'firebase.json'), 'utf8')) as {
    emulators: { firestore: { port: number }; storage: { port: number } }
  }
  const target = resolveSeedTarget({
    project: values.project,
    emulator: values.emulator,
    bucket: values.bucket,
    env: process.env,
    firebaserc: readFileSync(resolve(root, '.firebaserc'), 'utf8'),
    ports: {
      firestore: firebaseJson.emulators.firestore.port,
      storage: firebaseJson.emulators.storage.port,
    },
  })
  // Admin SDK はこの環境変数があれば Emulator につなぐ（認証情報は不要）
  if (target.emulatorHosts) {
    process.env.FIRESTORE_EMULATOR_HOST = target.emulatorHosts.firestore
    process.env.FIREBASE_STORAGE_EMULATOR_HOST = target.emulatorHosts.storage
  }
  console.log(
    target.emulatorHosts
      ? `接続先: Emulator（Firestore ${target.emulatorHosts.firestore}・Storage ${target.emulatorHosts.storage}）・${target.projectId}`
      : `接続先: 本番・${target.projectId}（バケット ${target.bucket}）`,
  )

  const app = initializeApp({ projectId: target.projectId, storageBucket: target.bucket })
  const today = todayInTokyo()
  const { written } = await seedCaseStudies({
    db: getFirestore(app),
    bucket: getStorage(app).bucket(target.bucket),
    root,
    today,
    force: values.force,
  })

  console.log(`施工事例を ${written.length} 件、下書きで入れました: ${written.join('・')}`)
  console.log('旧データに無い項目は仮の値です。管理画面で直してから「公開して保存」してください:')
  console.log(`  - 日付: ${today}（実行日）`)
  console.log(`  - 社名: ${PLACEHOLDER_COMPANY}`)
  console.log(
    `  - 分類（トップに表示）: ${LEGACY_CASE_STUDIES.map((item) => `${item.title}「${item.tag}」`).join('、')}（工事の種類から仮に付けたもの）`,
  )
}

// npm run seed:case-studies で直接実行されたときだけ動かす（テストから読み込むときは動かさない）
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
