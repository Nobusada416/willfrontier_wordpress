import { HONEYPOT_FIELD, safetySchema, type SafetyInput } from '@wf/shared'
import { FormFrame } from '~/components/form/FormFrame'
import { Honeypot } from '~/components/form/Honeypot'
import { PillSubmitButton } from '~/components/form/PillSubmitButton'
import { SubmitDialog } from '~/components/form/SubmitDialog'
import { TextField } from '~/components/form/TextField'
import { SubmitError } from './SubmitError'
import { useInquiryForm } from './useInquiryForm'

const DEFAULT_VALUES: SafetyInput = {
  name: '',
  kana: '',
  company: '',
  tel: '',
  email: '',
  message: '',
  [HONEYPOT_FIELD]: '',
}

const TITLE_ID = 'safety-form-title'
const LABEL_CLASS = 'sm:w-[140px]'

// 安全ページ下部のお問い合わせフォーム（旧 page-safety.php）
export function SafetyForm() {
  const { form, onSubmit, onFocusCapture, sent, closeDialog, failed } = useInquiryForm({
    schema: safetySchema,
    defaultValues: DEFAULT_VALUES,
    toPayload: (values) => ({ formType: 'safety', ...values }),
  })
  const {
    register,
    formState: { errors, isSubmitting },
  } = form
  const common = { variant: 'bracket', labelClassName: LABEL_CLASS } as const

  return (
    <>
      <form
        noValidate
        aria-labelledby={TITLE_ID}
        onSubmit={onSubmit}
        onFocusCapture={onFocusCapture}
        className="relative mt-3.5"
      >
        <FormFrame
          titleId={TITLE_ID}
          title="メールフォームからのお問い合わせ"
          className="border-black px-4 pt-2 pb-4 sm:px-7"
        >
          <div className="mx-auto flex max-w-[600px] flex-col gap-3 text-base">
            <SubmitError failed={failed} />
            <TextField
              {...common}
              label="担当者名"
              required
              autoComplete="name"
              registration={register('name')}
              error={errors.name?.message}
            />
            <TextField
              {...common}
              label="フリガナ"
              registration={register('kana')}
              error={errors.kana?.message}
            />
            <TextField
              {...common}
              label="会社名"
              autoComplete="organization"
              registration={register('company')}
              error={errors.company?.message}
            />
            <TextField
              {...common}
              label="電話番号"
              required
              type="tel"
              autoComplete="tel"
              registration={register('tel')}
              error={errors.tel?.message}
            />
            <TextField
              {...common}
              label="メールアドレス"
              type="email"
              autoComplete="email"
              registration={register('email')}
              error={errors.email?.message}
            />
            <TextField
              {...common}
              label="問い合わせ内容"
              multiline
              rows={3}
              registration={register('message')}
              error={errors.message?.message}
            />
            <Honeypot registration={register(HONEYPOT_FIELD)} />
          </div>

          <div className="mt-5 mb-5 text-center">
            <PillSubmitButton
              label="送信する"
              submitting={isSubmitting}
              className="px-16 text-xl sm:px-[140px] sm:text-2xl"
            />
          </div>
          <ul className="flex justify-center gap-3">
            {['見積無料', '秘密厳守'].map((badge) => (
              <li
                key={badge}
                className="border-[1.5px] border-wf-blue px-5 py-2 text-center text-[17px] font-black text-wf-blue sm:px-8"
              >
                {badge}
              </li>
            ))}
          </ul>
        </FormFrame>
      </form>

      <SubmitDialog open={sent} title="送信完了" onClose={closeDialog}>
        お問い合わせを受け付けました。
        <br />
        ありがとうございます。
        <br />
        担当者より折り返しご連絡いたします。
      </SubmitDialog>
    </>
  )
}
