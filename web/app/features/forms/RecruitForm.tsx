import { HONEYPOT_FIELD, recruitSchema, type RecruitInput } from '@wf/shared'
import { CheckboxField } from '~/components/form/CheckboxField'
import { FormFrame } from '~/components/form/FormFrame'
import { Honeypot } from '~/components/form/Honeypot'
import { PillSubmitButton } from '~/components/form/PillSubmitButton'
import { SubmitDialog } from '~/components/form/SubmitDialog'
import { TextField } from '~/components/form/TextField'
import { SubmitError } from './SubmitError'
import { useInquiryForm } from './useInquiryForm'

const DEFAULT_VALUES: RecruitInput = {
  name: '',
  kana: '',
  address: '',
  tel: '',
  email: '',
  emailConfirm: '',
  job: '',
  education: '',
  school: '',
  faculty: '',
  graduation: '',
  career: '',
  note: '',
  privacyConsent: false,
  [HONEYPOT_FIELD]: '',
}

const TITLE_ID = 'recruit-form-title'

// 旧実装はラベルの先頭に「○」（最終学歴の補足の 3 項目は全角空白）を付けていた。読み上げには含めない
const LABEL_CLASS = "sm:w-[170px] before:content-['○'_/_'']"
const SUB_LABEL_CLASS = "sm:w-[170px] before:content-['\\3000'_/_'']"

// 採用ページの応募フォーム（旧 page-recruit.php）
export function RecruitForm() {
  const { form, onSubmit, onFocusCapture, sent, closeDialog, failed } = useInquiryForm({
    schema: recruitSchema,
    defaultValues: DEFAULT_VALUES,
    toPayload: (values) => ({ formType: 'recruit', ...values }),
  })
  const {
    register,
    formState: { errors, isSubmitting },
  } = form
  const common = { variant: 'bracket', labelClassName: LABEL_CLASS } as const
  const sub = { variant: 'bracket', labelClassName: SUB_LABEL_CLASS } as const

  return (
    <>
      <form
        noValidate
        aria-labelledby={TITLE_ID}
        onSubmit={onSubmit}
        onFocusCapture={onFocusCapture}
        className="relative"
      >
        <FormFrame
          titleId={TITLE_ID}
          title="メールフォームからのご応募"
          className="border-wf-navy px-4 pt-6 pb-10 sm:px-[60px]"
        >
          <div className="mx-auto flex max-w-[700px] flex-col gap-3.5 text-[15px]">
            <SubmitError failed={failed} />
            <TextField
              {...common}
              label="お名前"
              required
              autoComplete="name"
              placeholder="例）田中　太郎"
              registration={register('name')}
              error={errors.name?.message}
            />
            <TextField
              {...common}
              label="フリガナ"
              required
              placeholder="例）タナカ　タロウ"
              registration={register('kana')}
              error={errors.kana?.message}
            />
            <TextField
              {...common}
              label="ご住所"
              required
              autoComplete="street-address"
              placeholder="例）〒000-0000"
              registration={register('address')}
              error={errors.address?.message}
            />
            <TextField
              {...common}
              label="電話番号"
              required
              type="tel"
              autoComplete="tel"
              placeholder="例）000-000-0000"
              registration={register('tel')}
              error={errors.tel?.message}
            />
            <TextField
              {...common}
              label="メールアドレス"
              required
              type="email"
              autoComplete="email"
              placeholder="例）example@willfrontier.co.jp"
              registration={register('email')}
              error={errors.email?.message}
            />
            {/* 旧実装はラベルの無い 2 つ目の入力欄だったため、確認用であることをラベルで示す */}
            <TextField
              {...sub}
              label="メールアドレス（確認用）"
              required
              type="email"
              autoComplete="email"
              description="確認のため、もう一度ご入力ください。"
              registration={register('emailConfirm')}
              error={errors.emailConfirm?.message}
            />
            <TextField
              {...common}
              label="希望職種"
              required
              placeholder="例）作業員"
              registration={register('job')}
              error={errors.job?.message}
            />
            <TextField
              {...common}
              label="最終学歴"
              required
              placeholder="例）大学卒業"
              registration={register('education')}
              error={errors.education?.message}
            />
            <TextField
              {...sub}
              label="学校名"
              placeholder="例）○○大学"
              registration={register('school')}
              error={errors.school?.message}
            />
            <TextField
              {...sub}
              label="卒業学部・学科"
              placeholder="例）○○学部、○○学科"
              registration={register('faculty')}
              error={errors.faculty?.message}
            />
            <TextField
              {...sub}
              label="卒業年月"
              placeholder="例）2026年3月"
              registration={register('graduation')}
              error={errors.graduation?.message}
            />
            {/* 旧実装は 1 行の入力欄だったが、職歴・備考は長くなりやすいため複数行にした */}
            <TextField
              {...common}
              label="職歴"
              multiline
              rows={2}
              registration={register('career')}
              error={errors.career?.message}
            />
            <TextField
              {...common}
              label="備考"
              required
              multiline
              rows={2}
              registration={register('note')}
              error={errors.note?.message}
            />
            <Honeypot registration={register(HONEYPOT_FIELD)} />
          </div>

          <div className="mt-8">
            <CheckboxField
              label="個人情報の取り扱いに同意する"
              required
              description="ご入力いただいた個人情報は、採用選考とそのご連絡のためにのみ利用します。"
              registration={register('privacyConsent')}
              error={errors.privacyConsent?.message}
            />
          </div>

          <div className="mt-8 text-center">
            <PillSubmitButton
              label="応募する"
              submitting={isSubmitting}
              className="px-16 text-[1.2rem] sm:px-20"
            />
          </div>
        </FormFrame>
      </form>

      <SubmitDialog open={sent} title="応募完了" onClose={closeDialog}>
        応募を受け付けました。
        <br />
        ありがとうございます。
        <br />
        担当者より折り返しご連絡いたします。
      </SubmitDialog>
    </>
  )
}
