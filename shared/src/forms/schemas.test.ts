import { describe, expect, it } from 'vitest'
import {
  contactSchema,
  FORM_FIELDS,
  HONEYPOT_FIELD,
  inquirySchema,
  isSpam,
  recruitSchema,
  safetySchema,
} from './schemas'

const validContact = {
  company: '株式会社テスト',
  name: '田中 太郎',
  tel: '045-123-4567',
  message: '回収の見積もりをお願いします。',
}

const validSafety = {
  name: '田中 太郎',
  kana: 'タナカ タロウ',
  company: '',
  tel: '045-123-4567',
  email: '',
  message: '',
}

const validRecruit = {
  name: '田中 太郎',
  kana: 'タナカ タロウ',
  address: '〒220-0000 神奈川県横浜市',
  tel: '090-1234-5678',
  email: 'taro@example.jp',
  emailConfirm: 'taro@example.jp',
  job: '作業員',
  education: '大学卒業',
  school: '',
  faculty: '',
  graduation: '',
  career: '',
  note: '平日の日中が連絡のつきやすい時間です。',
  privacyConsent: true,
}

// 失敗したときに、どの項目のエラーかを取り出す
const errorPaths = (result: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) =>
  result.error?.issues.map((issue) => issue.path.join('.')) ?? []

const firstMessage = (result: { error?: { issues: { message: string }[] } }) =>
  result.error?.issues[0]?.message

describe('contactSchema（お問い合わせページ）', () => {
  it('旧フォームと同じく会社名は任意、担当者名・電話番号・内容は必須', () => {
    expect(contactSchema.safeParse({ ...validContact, company: '' }).success).toBe(true)
    const result = contactSchema.safeParse({ company: '', name: '', tel: '', message: '' })
    expect(errorPaths(result).sort()).toEqual(['message', 'name', 'tel'])
  })

  it('空白だけの入力は未入力として扱う', () => {
    const result = contactSchema.safeParse({ ...validContact, name: '　 ' })
    expect(errorPaths(result)).toEqual(['name'])
    expect(firstMessage(result)).toBe('担当者名を入力してください')
  })

  it('全角で入力された電話番号を半角に直す', () => {
    const result = contactSchema.parse({ ...validContact, tel: '０４５ー１２３ー４５６７' })
    expect(result.tel).toBe('045-123-4567')
  })

  it('1 行の項目に入った改行・タブ・制御文字は空白にする（メールの件名・本文の偽装を防ぐ）', () => {
    const result = contactSchema.parse({
      ...validContact,
      name: '田中\r\n太郎\t様\u0000',
      company: 'A社\n担当者名：偽',
    })
    expect(result.name).toBe('田中 太郎 様')
    expect(result.company).toBe('A社 担当者名：偽')
  })

  it('複数行の項目は改行を残す', () => {
    const result = contactSchema.parse({ ...validContact, message: '1 行目\n2 行目' })
    expect(result.message).toBe('1 行目\n2 行目')
  })

  it('電話番号として長すぎるものは受け付けない', () => {
    const result = contactSchema.safeParse({ ...validContact, tel: `045${'-'.repeat(30)}1234567` })
    expect(errorPaths(result)).toEqual(['tel'])
  })

  it('電話番号として桁数が足りないものは受け付けない', () => {
    const result = contactSchema.safeParse({ ...validContact, tel: '045-123' })
    expect(errorPaths(result)).toEqual(['tel'])
    expect(firstMessage(result)).toBe('電話番号を正しく入力してください')
  })

  it('文字数の上限を超える内容は受け付けない', () => {
    const result = contactSchema.safeParse({ ...validContact, message: 'あ'.repeat(2001) })
    expect(errorPaths(result)).toEqual(['message'])
  })
})

describe('safetySchema（安全ページのお問い合わせ）', () => {
  it('旧フォームと同じく担当者名と電話番号だけが必須', () => {
    expect(safetySchema.safeParse(validSafety).success).toBe(true)
    const result = safetySchema.safeParse({ ...validSafety, name: '', tel: '' })
    expect(errorPaths(result).sort()).toEqual(['name', 'tel'])
  })

  it('メールアドレスは任意だが、入力された場合は形式を確かめる', () => {
    expect(safetySchema.safeParse({ ...validSafety, email: 'taro@example.jp' }).success).toBe(true)
    const result = safetySchema.safeParse({ ...validSafety, email: 'taro@' })
    expect(errorPaths(result)).toEqual(['email'])
    expect(firstMessage(result)).toBe('メールアドレスを正しく入力してください')
  })

  it('全角で入力されたメールアドレスを半角に直す', () => {
    const result = safetySchema.parse({ ...validSafety, email: 'ｔａｒｏ＠ｅｘａｍｐｌｅ．ｊｐ' })
    expect(result.email).toBe('taro@example.jp')
  })
})

describe('recruitSchema（採用応募）', () => {
  it('旧フォームの必須項目（お名前〜最終学歴・備考）と、個人情報の取り扱いへの同意が必須', () => {
    expect(recruitSchema.safeParse(validRecruit).success).toBe(true)
    const empty = Object.fromEntries(Object.keys(validRecruit).map((key) => [key, '']))
    const result = recruitSchema.safeParse({ ...empty, privacyConsent: false })
    expect(errorPaths(result).sort()).toEqual(
      [
        'address',
        'education',
        'email',
        'emailConfirm',
        'job',
        'kana',
        'name',
        'note',
        'privacyConsent',
        'tel',
      ].sort(),
    )
  })

  it('確認用のメールアドレスが一致しなければ、確認欄のエラーにする', () => {
    const result = recruitSchema.safeParse({ ...validRecruit, emailConfirm: 'jiro@example.jp' })
    expect(errorPaths(result)).toEqual(['emailConfirm'])
    expect(firstMessage(result)).toBe('メールアドレスが一致しません')
  })

  it('大文字と小文字の違いだけなら一致とみなす', () => {
    const result = recruitSchema.safeParse({ ...validRecruit, emailConfirm: 'Taro@Example.JP' })
    expect(result.success).toBe(true)
  })

  it('送信値（inquirySchema）でも、確認用メールアドレスの不一致は確認欄のエラーにする', () => {
    const result = inquirySchema.safeParse({
      formType: 'recruit',
      ...validRecruit,
      emailConfirm: 'jiro@example.jp',
    })
    expect(errorPaths(result)).toEqual(['emailConfirm'])
  })

  it('全角と半角の違いだけなら一致とみなす', () => {
    const result = recruitSchema.safeParse({
      ...validRecruit,
      emailConfirm: 'ｔａｒｏ＠ｅｘａｍｐｌｅ．ｊｐ',
    })
    expect(result.success).toBe(true)
  })

  it('同意のチェックが無ければ受け付けない', () => {
    const result = recruitSchema.safeParse({ ...validRecruit, privacyConsent: false })
    expect(errorPaths(result)).toEqual(['privacyConsent'])
    expect(firstMessage(result)).toBe('個人情報の取り扱いに同意してください')
  })
})

describe('inquirySchema（送信処理が受け取る値）', () => {
  it('formType でフォームを見分けて検証する', () => {
    expect(inquirySchema.safeParse({ formType: 'contact', ...validContact }).success).toBe(true)
    expect(inquirySchema.safeParse({ formType: 'recruit', ...validRecruit }).success).toBe(true)
    // お問い合わせの値を採用応募として送っても通らない
    expect(inquirySchema.safeParse({ formType: 'recruit', ...validContact }).success).toBe(false)
  })

  it('未知のフォーム種別は受け付けない', () => {
    expect(inquirySchema.safeParse({ formType: 'other', ...validContact }).success).toBe(false)
  })

  it('スキーマに無い項目は取り除く', () => {
    const result = inquirySchema.parse({ formType: 'contact', ...validContact, admin: true })
    expect(result).not.toHaveProperty('admin')
  })
})

describe('honeypot（ボット対策の隠し項目）', () => {
  it('隠し項目の名前は、ブラウザの自動入力が値を入れない名前にする', () => {
    // website・url などは自動入力やパスワードマネージャーが値を入れ、人の送信を捨ててしまうおそれがある
    expect(HONEYPOT_FIELD).toBe('wf_hp')
  })

  it('隠し項目が空なら人の送信とみなす', () => {
    const value = inquirySchema.parse({ formType: 'contact', ...validContact, [HONEYPOT_FIELD]: '' })
    expect(isSpam(value)).toBe(false)
    expect(isSpam(inquirySchema.parse({ formType: 'contact', ...validContact }))).toBe(false)
  })

  it('隠し項目が入力されていればボットとみなす（検証エラーにはせず、送信処理で黙って捨てる）', () => {
    const result = inquirySchema.safeParse({
      formType: 'contact',
      ...validContact,
      [HONEYPOT_FIELD]: 'https://spam.example',
    })
    expect(result.success).toBe(true)
    if (result.success) expect(isSpam(result.data)).toBe(true)
  })
})

describe('FORM_FIELDS（メール本文の項目名と順番）', () => {
  it('各フォームの項目をすべて、画面と同じ項目名で持つ', () => {
    expect(FORM_FIELDS.contact.map((field) => field.label)).toEqual([
      '会社名',
      '担当者名',
      '電話番号',
      '内容',
    ])
    expect(FORM_FIELDS.safety.map((field) => field.name)).toEqual([
      'name',
      'kana',
      'company',
      'tel',
      'email',
      'message',
    ])
  })

  it('採用応募は確認用メールアドレスと同意の項目をメールに含めない', () => {
    const names = FORM_FIELDS.recruit.map((field) => field.name)
    expect(names).not.toContain('emailConfirm')
    expect(names).not.toContain('privacyConsent')
    expect(names).toHaveLength(12)
  })
})
