// 必須の項目のラベルに付ける印（旧採用フォームの赤い「必須」）
export function RequiredBadge() {
  return (
    <span className="ml-1.5 inline-block rounded-xs bg-wf-danger px-1.5 py-0.5 align-middle text-[10px] leading-none font-bold text-white">
      必須
    </span>
  )
}
