import { zodResolver } from '@hookform/resolvers/zod'
import type { InquiryPayload } from '@wf/shared'
import { useRef, useState } from 'react'
import { useForm, type DefaultValues, type FieldValues, type Path } from 'react-hook-form'
import type { z } from 'zod'
import { prepareSubmitInquiry, submitInquiry } from '~/lib/submitInquiry'

type Options<TInput extends FieldValues, TOutput> = {
  // @wf/shared のフォームのスキーマ（画面と送信処理で同じ入力チェックを使う）
  schema: z.ZodType<TOutput, TInput>
  defaultValues: TInput
  // 検証後の値に formType を付けて、送信処理に渡す値にする
  toPayload: (values: TOutput) => InquiryPayload
}

// 3 つのフォームで共通の、入力チェック・送信・送信後の状態の管理
export function useInquiryForm<TInput extends FieldValues, TOutput>({
  schema,
  defaultValues,
  toPayload,
}: Options<TInput, TOutput>) {
  const form = useForm<TInput, unknown, TOutput>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<TInput>,
  })
  // 送信完了のダイアログを開いているか
  const [sent, setSent] = useState(false)
  // 通信エラーなどで送れなかったか
  const [failed, setFailed] = useState(false)
  const prepared = useRef(false)

  const onSubmit = form.handleSubmit(async (values) => {
    setFailed(false)
    const result = await submitInquiry(toPayload(values))
    if (result.status === 'ok') {
      form.reset()
      setSent(true)
      return
    }
    if (result.status === 'invalid') {
      // 画面と送信処理は同じスキーマのため通常は起きないが、起きた場合は項目ごとに出す
      const names = Object.keys(result.fieldErrors).filter(
        (name): name is Path<TInput> => name in defaultValues,
      )
      if (names.length > 0) {
        names.forEach((name) =>
          form.setError(
            name,
            { type: 'server', message: result.fieldErrors[name] },
            { shouldFocus: name === names[0] },
          ),
        )
        return
      }
    }
    setFailed(true)
  })

  // 送信中はボタンを押せなくするため、ダイアログを閉じたときにブラウザが戻すフォーカス先（送信ボタン）が
  // 無効になっている。入力欄を空にした後なので、最初の入力欄へフォーカスを戻す
  const closeDialog = () => {
    setSent(false)
    const [firstField] = Object.keys(defaultValues)
    if (firstField) form.setFocus(firstField as Path<TInput>)
  }

  // フォームに初めてフォーカスが入ったときに送信の準備を始める
  const onFocusCapture = () => {
    if (prepared.current) return
    prepared.current = true
    prepareSubmitInquiry()
  }

  return {
    form,
    onSubmit,
    onFocusCapture,
    sent,
    closeDialog,
    failed,
  }
}
