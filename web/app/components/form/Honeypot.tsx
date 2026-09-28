import type { UseFormRegisterReturn } from 'react-hook-form'

// ボット対策の隠し項目（docs/forms.md）。人には見えず、読み上げ・Tab 移動の対象にもしない。
// display: none の欄は入力しないボットもあるため、画面の外に置いて隠す
export function Honeypot({ registration }: { registration: UseFormRegisterReturn }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
      <label>
        ウェブサイト（入力しないでください）
        <input type="text" tabIndex={-1} autoComplete="off" {...registration} />
      </label>
    </div>
  )
}
