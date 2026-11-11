import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestContext,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  CASE_STUDY_IMAGE_CONTENT_TYPES,
  CASE_STUDY_UPLOAD_MAX_BYTES,
  caseStudyPhotoPath,
} from '@wf/shared'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

// Cloud Storage のセキュリティルール。
// - case-studies/ の下（施工事例の写真）は誰でも読める
// - 書き込み・削除はカスタムクレーム admin == true のユーザーだけ。
//   書き込みは case-studies/{事例の ID}/{写真の ID}-{small|large}.{webp|jpg} の形・拡張子に合った形式
//   （.webp は image/webp、.jpg は image/jpeg）・サイズの上限を満たすものだけ
// - そのほかの場所はすべて拒否する
let env: RulesTestEnvironment

const EXISTING = caseStudyPhotoPath('case1', 'photo1', 'large', 'image/webp')
const OTHER = 'other/file.webp'

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-willfrontier-rules',
    storage: { rules: readFileSync(resolve(__dirname, '../../storage.rules'), 'utf8') },
  })
})

afterAll(async () => {
  await env.cleanup()
})

const bytes = (size: number) => new Uint8Array(size)
const webp = { contentType: 'image/webp' }

// rules-unit-testing の storage() は compat 版の API を返す
const upload = (
  context: RulesTestContext,
  path: string,
  size = 16,
  metadata: { contentType: string } = webp,
) => {
  const task = context.storage().ref(path).put(bytes(size), metadata)
  return task.then()
}
const read = (context: RulesTestContext, path: string) => context.storage().ref(path).getMetadata()
const remove = (context: RulesTestContext, path: string) => context.storage().ref(path).delete()

beforeEach(async () => {
  await env.clearStorage()
  await env.withSecurityRulesDisabled(async (context) => {
    await upload(context, EXISTING)
    await upload(context, OTHER)
  })
})

const visitors = [
  { label: '未ログイン', context: () => env.unauthenticatedContext() },
  { label: '一般ユーザー', context: () => env.authenticatedContext('user-1') },
  {
    label: 'admin が false のユーザー',
    context: () => env.authenticatedContext('user-2', { admin: false }),
  },
]

describe.each(visitors)('$label', ({ context }) => {
  it('施工事例の写真を読める', async () => {
    await assertSucceeds(read(context(), EXISTING))
  })

  it('ほかの場所は読めない', async () => {
    await assertFails(read(context(), OTHER))
  })

  it('施工事例の写真をアップロードできない', async () => {
    await assertFails(
      upload(context(), caseStudyPhotoPath('case1', 'photo2', 'small', 'image/webp')),
    )
  })

  it('施工事例の写真を上書きできない', async () => {
    await assertFails(upload(context(), EXISTING))
  })

  it('施工事例の写真を削除できない', async () => {
    await assertFails(remove(context(), EXISTING))
  })

  it('ほかの場所に書き込めない', async () => {
    await assertFails(upload(context(), 'other/new.webp'))
  })
})

describe('admin（カスタムクレーム admin == true）', () => {
  const admin = () => env.authenticatedContext('admin-1', { admin: true })

  it.each(
    CASE_STUDY_IMAGE_CONTENT_TYPES.flatMap((contentType) =>
      (['small', 'large'] as const).map((size) => ({ contentType, size })),
    ),
  )('$size の $contentType をアップロードできる', async ({ contentType, size }) => {
    await assertSucceeds(
      upload(admin(), caseStudyPhotoPath('case1', 'photo2', size, contentType), 16, {
        contentType,
      }),
    )
  })

  it.each(CASE_STUDY_IMAGE_CONTENT_TYPES)(
    '%s は上限ちょうどのサイズまでアップロードできる',
    async (contentType) => {
      await assertSucceeds(
        upload(
          admin(),
          caseStudyPhotoPath('case1', 'photo2', 'large', contentType),
          CASE_STUDY_UPLOAD_MAX_BYTES,
          { contentType },
        ),
      )
    },
  )

  it('施工事例の写真を削除できる', async () => {
    await assertSucceeds(remove(admin(), EXISTING))
  })

  it.each(CASE_STUDY_IMAGE_CONTENT_TYPES)(
    '%s は上限を超えるサイズをアップロードできない',
    async (contentType) => {
      await assertFails(
        upload(
          admin(),
          caseStudyPhotoPath('case1', 'photo2', 'large', contentType),
          CASE_STUDY_UPLOAD_MAX_BYTES + 1,
          { contentType },
        ),
      )
    },
  )

  it.each(['image/png', 'image/svg+xml', 'text/html'])(
    '%s はアップロードできない',
    async (contentType) => {
      await assertFails(
        upload(admin(), 'case-studies/case1/photo2-large.webp', 16, { contentType }),
      )
      await assertFails(upload(admin(), 'case-studies/case1/photo2-large.jpg', 16, { contentType }))
    },
  )

  it.each([
    ['case-studies/case1/photo2-large.webp', 'image/jpeg'],
    ['case-studies/case1/photo2-large.jpg', 'image/webp'],
  ])('拡張子と形式が合わない %s（%s）はアップロードできない', async (path, contentType) => {
    await assertFails(upload(admin(), path, 16, { contentType }))
  })

  it.each([
    'case-studies/case1/photo2.webp',
    'case-studies/case1/photo2-medium.webp',
    'case-studies/case1/photo2-large.png',
    'case-studies/case1/photo2-large.jpeg',
    'case-studies/case1/photo2-large.webp.jpg',
    'case-studies/case1/sub/photo2-large.webp',
    'case-studies/photo2-large.webp',
    'case-studies/bad.id/photo2-large.webp',
  ])('決まった形でないパス %s にはアップロードできない', async (path) => {
    await assertFails(upload(admin(), path))
  })

  it('ほかの場所は読み書きできない', async () => {
    await assertFails(read(admin(), OTHER))
    await assertFails(upload(admin(), 'other/new.webp'))
    await assertFails(remove(admin(), OTHER))
  })
})
