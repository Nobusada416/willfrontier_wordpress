import { contactSchema, HONEYPOT_FIELD, type ContactInput } from '@wf/shared'
import { Honeypot } from '~/components/form/Honeypot'
import { SubmitDialog } from '~/components/form/SubmitDialog'
import { TextField } from '~/components/form/TextField'
import { SubmitError } from './SubmitError'
import { useInquiryForm } from './useInquiryForm'

const DEFAULT_VALUES: ContactInput = {
  company: '',
  name: '',
  tel: '',
  message: '',
  [HONEYPOT_FIELD]: '',
}

const LABEL_CLASS = 'sm:w-[96px]'

// お問い合わせページのフォーム（旧 page-contact.php）
export function ContactForm() {
  const { form, onSubmit, onFocusCapture, sent, closeDialog, failed } = useInquiryForm({
    schema: contactSchema,
    defaultValues: DEFAULT_VALUES,
    toPayload: (values) => ({ formType: 'contact', ...values }),
  })
  const {
    register,
    formState: { errors, isSubmitting },
  } = form

  return (
    <>
      <form
        noValidate
        aria-label="お問い合わせフォーム"
        onSubmit={onSubmit}
        onFocusCapture={onFocusCapture}
        className="relative mb-7"
      >
        <div className="mx-auto flex max-w-[520px] flex-col gap-2.5">
          <SubmitError failed={failed} />
          <TextField
            label="会社名"
            autoComplete="organization"
            registration={register('company')}
            error={errors.company?.message}
            labelClassName={LABEL_CLASS}
          />
          <TextField
            label="担当者名"
            required
            autoComplete="name"
            registration={register('name')}
            error={errors.name?.message}
            labelClassName={LABEL_CLASS}
          />
          <TextField
            label="電話番号"
            required
            type="tel"
            autoComplete="tel"
            registration={register('tel')}
            error={errors.tel?.message}
            labelClassName={LABEL_CLASS}
          />
          <TextField
            label="内容"
            required
            multiline
            rows={4}
            registration={register('message')}
            error={errors.message?.message}
            labelClassName={LABEL_CLASS}
          />
          <Honeypot registration={register(HONEYPOT_FIELD)} />
        </div>

        <div className="mt-2.5 mb-4 text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2.5 rounded-md bg-wf-blue px-16 py-[18px] text-base font-black tracking-[0.1em] text-white transition hover:-translate-y-0.5 hover:bg-wf-blue-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wf-blue disabled:translate-y-0 disabled:cursor-wait disabled:opacity-70"
          >
            {isSubmitting ? '送信中…' : '送信する'}
            <span aria-hidden="true">→</span>
          </button>
        </div>

        {/* 旧実装はスマホで横幅が足りず 1 文字ずつ縦に折り返していたため、幅を分け合う */}
        <ul className="mx-auto flex max-w-[520px] justify-center gap-2.5">
          {['見積無料', '秘密厳守'].map((badge) => (
            <li
              key={badge}
              className="flex-1 rounded-md bg-gray-100 px-4 py-[18px] text-center text-[15px] font-black tracking-[0.05em] text-wf-ink sm:flex-none sm:px-[72px]"
            >
              {badge}
            </li>
          ))}
        </ul>
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
