import { describe, expect, it } from 'vitest'
import { CASE_STUDY_MAX_LENGTH } from './constants'
import {
  CASE_STUDY_DOCUMENT_KEYS,
  CASE_STUDY_PHOTO_KEYS,
  caseStudyContentSchema,
  caseStudyFormSchema,
  caseStudyPhotoSchema,
  type CaseStudyContent,
  type CaseStudyFormInput,
} from './schema'

const photo = (n: number) => ({
  path: `case-studies/case1/photo${n}.webp`,
  smallUrl: `https://firebasestorage.googleapis.com/v0/b/demo/o/photo${n}-small.webp?alt=media`,
  largeUrl: `https://firebasestorage.googleapis.com/v0/b/demo/o/photo${n}-large.webp?alt=media`,
  width: 1600,
  height: 1067,
  alt: `現場の写真 ${n}`,
})

const validForm: CaseStudyFormInput = {
  date: '2026-04-01',
  tag: '運用開始',
  company: '株式会社テスト',
  title: '工場リノベーション廃材処理',
  category: '産業廃棄物 / 金属類 / 機械設備',
  description: '稼働中の工場を一部解体し、\n設備更新に伴う大量の廃材を選別。',
  photos: [photo(1)],
}

const validContent: CaseStudyContent = { status: 'published', ...validForm, photos: [photo(1)] }

const errorPaths = (result: { error?: { issues: { path: PropertyKey[] }[] } }) =>
  result.error?.issues.map((issue) => issue.path.join('.')) ?? []

const messages = (result: { error?: { issues: { message: string }[] } }) =>
  result.error?.issues.map((issue) => issue.message) ?? []

describe('caseStudyFormSchema（管理画面の編集フォーム）', () => {
  it('正しい入力を通す', () => {
    expect(caseStudyFormSchema.safeParse(validForm).success).toBe(true)
  })

  it('写真の説明以外はすべて必須。未入力は日本語で「入力してください」', () => {
    const result = caseStudyFormSchema.safeParse({
      date: '',
      tag: '',
      company: '',
      title: '',
      category: '',
      description: '',
      photos: [],
    })
    expect(errorPaths(result).sort()).toEqual(
      ['category', 'company', 'date', 'description', 'photos', 'tag', 'title'].sort(),
    )
    expect(messages(result).sort()).toEqual(
      [
        '日付を入力してください',
        '分類を入力してください',
        '社名を入力してください',
        'タイトルを入力してください',
        '工事の種類を入力してください',
        '本文を入力してください',
        '写真を1枚以上追加してください',
      ].sort(),
    )
  })

  it('前後の空白を除き、空白だけは未入力として扱う', () => {
    const result = caseStudyFormSchema.safeParse({ ...validForm, title: '  　 ', company: ' A社 ' })
    expect(errorPaths(result)).toEqual(['title'])
    const ok = caseStudyFormSchema.parse({ ...validForm, company: ' A社 ' })
    expect(ok.company).toBe('A社')
  })

  it('1 行の項目の改行は空白にし、本文の改行は \\n にそろえて残す', () => {
    const value = caseStudyFormSchema.parse({
      ...validForm,
      title: '工場の\n廃材処理',
      description: '1 行目\r\n2 行目\r3 行目',
    })
    expect(value.title).toBe('工場の 廃材処理')
    expect(value.description).toBe('1 行目\n2 行目\n3 行目')
  })

  it.each([
    ['company', '社名'],
    ['tag', '分類'],
    ['title', 'タイトル'],
    ['category', '工事の種類'],
    ['description', '本文'],
  ] as const)('%s は最大文字数まで通し、超えたら「%sは○文字以内」', (key, label) => {
    const max = CASE_STUDY_MAX_LENGTH[key]
    expect(caseStudyFormSchema.safeParse({ ...validForm, [key]: 'あ'.repeat(max) }).success).toBe(
      true,
    )
    const result = caseStudyFormSchema.safeParse({ ...validForm, [key]: 'あ'.repeat(max + 1) })
    expect(messages(result)).toEqual([`${label}は${max}文字以内で入力してください`])
  })

  it('本文は 400 文字まで', () => {
    expect(CASE_STUDY_MAX_LENGTH.description).toBe(400)
  })

  it.each(['2026/04/01', '2026-4-1', '2026-02-30', '2026-13-01', '2026.00.00', 'abc'])(
    '日付 %s は「日付を正しく入力してください」',
    (date) => {
      const result = caseStudyFormSchema.safeParse({ ...validForm, date })
      expect(messages(result)).toEqual(['日付を正しく入力してください'])
    },
  )

  it('うるう年の 2 月 29 日は通す', () => {
    expect(caseStudyFormSchema.safeParse({ ...validForm, date: '2028-02-29' }).success).toBe(true)
  })

  it('写真は 4 枚まで', () => {
    const four = { ...validForm, photos: [1, 2, 3, 4].map(photo) }
    expect(caseStudyFormSchema.safeParse(four).success).toBe(true)
    const five = { ...validForm, photos: [1, 2, 3, 4, 5].map(photo) }
    expect(messages(caseStudyFormSchema.safeParse(five))).toEqual(['写真は4枚までです'])
  })

  it('写真の説明は任意で、長すぎるとエラー', () => {
    const empty = caseStudyFormSchema.parse({ ...validForm, photos: [{ ...photo(1), alt: '' }] })
    expect(empty.photos[0]?.alt).toBe('')
    const long = caseStudyFormSchema.safeParse({
      ...validForm,
      photos: [{ ...photo(1), alt: 'あ'.repeat(CASE_STUDY_MAX_LENGTH.alt + 1) }],
    })
    expect(errorPaths(long)).toEqual(['photos.0.alt'])
    expect(messages(long)).toEqual([
      `写真の説明は${CASE_STUDY_MAX_LENGTH.alt}文字以内で入力してください`,
    ])
  })

  it('status・日時などフォームに無い項目は取り除く', () => {
    const value = caseStudyFormSchema.parse({ ...validForm, status: 'published', updatedBy: 'x' })
    expect(value).not.toHaveProperty('status')
    expect(value).not.toHaveProperty('updatedBy')
  })
})

describe('caseStudyPhotoSchema（保存される写真）', () => {
  it('正しい写真を通す（JPEG・Emulator の http の URL も可）', () => {
    expect(caseStudyPhotoSchema.safeParse(photo(1)).success).toBe(true)
    expect(
      caseStudyPhotoSchema.safeParse({ ...photo(1), path: 'case-studies/case1/photo1.jpg' })
        .success,
    ).toBe(true)
    expect(
      caseStudyPhotoSchema.safeParse({
        ...photo(1),
        smallUrl: 'http://127.0.0.1:9199/v0/b/demo/o/a-small.webp?alt=media',
      }).success,
    ).toBe(true)
  })

  it.each([
    ['path が case-studies/ で始まらない', { path: 'other/case1/photo1' }],
    ['path に余分な階層がある', { path: 'case-studies/case1/a/b.webp' }],
    ['path に拡張子が無い', { path: 'case-studies/case1/photo1' }],
    ['path の拡張子が webp・jpg でない', { path: 'case-studies/case1/photo1.png' }],
    ['URL が http(s) でない', { largeUrl: 'javascript:alert(1)' }],
    ['幅が 0', { width: 0 }],
    ['高さが小数', { height: 10.5 }],
    ['幅が大きすぎる', { width: 10001 }],
  ])('%s は通さない', (_label, patch) => {
    expect(caseStudyPhotoSchema.safeParse({ ...photo(1), ...patch }).success).toBe(false)
  })

  it('キーの一覧は保存される項目と同じ', () => {
    expect([...CASE_STUDY_PHOTO_KEYS].sort()).toEqual(Object.keys(photo(1)).sort())
  })
})

describe('caseStudyContentSchema（保存・公開される内容）', () => {
  it('正しい内容を通す', () => {
    expect(caseStudyContentSchema.safeParse(validContent).success).toBe(true)
    expect(caseStudyContentSchema.safeParse({ ...validContent, status: 'draft' }).success).toBe(
      true,
    )
  })

  it('status は draft か published だけ', () => {
    expect(caseStudyContentSchema.safeParse({ ...validContent, status: 'private' }).success).toBe(
      false,
    )
  })

  it('値を書き換えない（前後の空白も検証だけ）', () => {
    const result = caseStudyContentSchema.safeParse({ ...validContent, title: ' 空白付き ' })
    expect(result.success).toBe(true)
    expect(result.data?.title).toBe(' 空白付き ')
  })

  it('必須の文字列が空なら通さない', () => {
    expect(caseStudyContentSchema.safeParse({ ...validContent, company: '' }).success).toBe(false)
  })

  it('写真は 1〜4 枚', () => {
    expect(caseStudyContentSchema.safeParse({ ...validContent, photos: [] }).success).toBe(false)
    expect(
      caseStudyContentSchema.safeParse({ ...validContent, photos: [1, 2, 3, 4, 5].map(photo) })
        .success,
    ).toBe(false)
  })

  it('ドキュメントのキーの一覧は内容と日時・更新者', () => {
    expect([...CASE_STUDY_DOCUMENT_KEYS].sort()).toEqual(
      [...Object.keys(validContent), 'createdAt', 'updatedAt', 'updatedBy'].sort(),
    )
  })
})
