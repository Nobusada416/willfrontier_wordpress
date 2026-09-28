import { contactSchema, recruitSchema, safetySchema } from '@wf/shared'
import { describe, expect, it } from 'vitest'
import { buildMail } from './buildMail'

// buildMail は検証済みの値だけを受け取るため、各フォームのスキーマを通した値を使う
const contact = {
  formType: 'contact' as const,
  ...contactSchema.parse({
    company: '株式会社テスト',
    name: '山田 太郎',
    tel: '03-1234-5678',
    message: 'お見積りをお願いします',
  }),
}

const safety = {
  formType: 'safety' as const,
  ...safetySchema.parse({
    name: '佐藤 花子',
    kana: 'サトウ ハナコ',
    company: '',
    tel: '090-1234-5678',
    email: 'hanako@example.com',
    message: '安全講習について',
  }),
}

const recruit = {
  formType: 'recruit' as const,
  ...recruitSchema.parse({
    name: '鈴木 一郎',
    kana: 'スズキ イチロウ',
    address: '神奈川県横浜市',
    tel: '080-1234-5678',
    email: 'ichiro@example.com',
    emailConfirm: 'ichiro@example.com',
    job: 'ドライバー',
    education: '高校卒業',
    school: '',
    faculty: '',
    graduation: '',
    career: '',
    note: 'よろしくお願いします',
    privacyConsent: true,
  }),
}

const TO = 'inbox@example.com'

describe('buildMail', () => {
  describe('件名', () => {
    it('お問い合わせは担当者名を入れる（旧 page-contact.php と同じ）', () => {
      expect(buildMail(contact, TO).message.subject).toBe(
        '【ウィルフロンティア】お問い合わせ：山田 太郎 様',
      )
    })

    it('安全ページの問い合わせは固定の件名（旧 page-safety.php と同じ）', () => {
      expect(buildMail(safety, TO).message.subject).toBe('【ウィルフロンティア】お問い合わせ')
    })

    it('採用応募は固定の件名（旧 page-recruit.php と同じ）', () => {
      expect(buildMail(recruit, TO).message.subject).toBe('【ウィルフロンティア】採用応募')
    })

    it('入力値の改行・制御文字を件名に入れない（メールヘッダー・インジェクション対策）', () => {
      const injected = { ...contact, name: '山田\r\nBcc: attacker@example.com\t\u0000太郎\u2028' }
      const { subject } = buildMail(injected, TO).message
      expect(subject).not.toMatch(/[\p{Cc}\p{Zl}\p{Zp}]/u)
      expect(subject).toBe(
        '【ウィルフロンティア】お問い合わせ：山田 Bcc: attacker@example.com 太郎 様',
      )
    })
  })

  describe('宛先と返信先', () => {
    it('宛先は引数で受け取ったものを使う', () => {
      expect(buildMail(contact, TO).to).toBe(TO)
    })

    it('お問い合わせはメールアドレスの項目がないため返信先を付けない', () => {
      expect(buildMail(contact, TO)).not.toHaveProperty('replyTo')
    })

    it('安全ページの問い合わせはメールアドレスが入力されていれば返信先にする', () => {
      expect(buildMail(safety, TO).replyTo).toBe('hanako@example.com')
    })

    it('安全ページの問い合わせでメールアドレスが未入力なら返信先を付けない', () => {
      expect(buildMail({ ...safety, email: '' }, TO)).not.toHaveProperty('replyTo')
    })

    it('採用応募は応募者のメールアドレスを返信先にする', () => {
      expect(buildMail(recruit, TO).replyTo).toBe('ichiro@example.com')
    })
  })

  describe('本文', () => {
    const labelsOf = (text: string) =>
      text
        .split('\n')
        .filter((line) => line.includes('：'))
        .map((line) => line.split('：')[0])

    it('「項目名：値」を FORM_FIELDS の順に 1 行ずつ並べる', () => {
      expect(buildMail(contact, TO).message.text).toBe(
        [
          '会社名：株式会社テスト',
          '担当者名：山田 太郎',
          '電話番号：03-1234-5678',
          '内容：お見積りをお願いします',
        ].join('\n') + '\n',
      )
    })

    it('安全ページの問い合わせの項目順', () => {
      expect(labelsOf(buildMail(safety, TO).message.text)).toEqual([
        '担当者名',
        'フリガナ',
        '会社名',
        '電話番号',
        'メールアドレス',
        '問い合わせ内容',
      ])
    })

    it('採用応募の項目順。確認用メールアドレス・同意・隠し項目は載せない', () => {
      const { text } = buildMail(recruit, TO).message
      expect(labelsOf(text)).toEqual([
        'お名前',
        'フリガナ',
        'ご住所',
        '電話番号',
        'メールアドレス',
        '希望職種',
        '最終学歴',
        '学校名',
        '卒業学部・学科',
        '卒業年月',
        '職歴',
        '備考',
      ])
      expect(text.match(/ichiro@example\.com/g)).toHaveLength(1)
      expect(text).not.toContain('true')
    })

    it('未入力の任意項目は項目名だけを出す', () => {
      expect(buildMail(safety, TO).message.text).toContain('\n会社名：\n')
    })

    it('複数行の値は項目名の次の行から載せ、改行コードを LF にそろえる', () => {
      const multiline = { ...contact, message: '1 行目\r\n2 行目\r3 行目' }
      expect(buildMail(multiline, TO).message.text).toContain('内容：\n1 行目\n2 行目\n3 行目\n')
    })

    it('本文から改行・タブ以外の制御文字を取り除く', () => {
      const withControl = { ...contact, message: 'a\u0000b\u001bc\td' }
      expect(buildMail(withControl, TO).message.text).toContain('内容：abc\td\n')
    })
  })
})
