import { CASE_STUDY_PHOTOS_MAX, type CaseStudyPhoto } from '@wf/shared'
import type { ChangeEvent } from 'react'
import { PHOTO_ACCEPT } from './photos'
import { ErrorNotice, INPUT_CLASS, RequiredMark } from './ui'

type PhotoFieldProps = {
  photos: CaseStudyPhoto[]
  // 写真の説明（alt）の入力
  onAltChange: (index: number, alt: string) => void
  altErrors: (string | undefined)[]
  // 枚数などの写真全体のエラー（写真を1枚以上追加してください）
  error: string | undefined
  // 処理中（縮小・アップロード中）の枚数
  processing: number
  // 写真ごとの処理の失敗
  failures: string[]
  onAdd: (files: File[]) => void
  onRemove: (index: number) => void
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

// 写真（最大 4 枚。1 枚目がメイン）。選んだ写真はブラウザで縮小してすぐアップロードする
export function PhotoField({
  photos,
  onAltChange,
  altErrors,
  error,
  processing,
  failures,
  onAdd,
  onRemove,
}: PhotoFieldProps) {
  const remaining = CASE_STUDY_PHOTOS_MAX - photos.length - processing
  const headingId = 'photos-heading'
  const errorId = 'photos-error'

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    // 同じ写真を続けて選び直せるよう、選択を空に戻す
    event.target.value = ''
    if (files.length > 0) onAdd(files)
  }

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-5 rounded-xl border border-wf-border bg-white p-5 sm:p-7"
    >
      <div className="flex flex-col gap-1">
        <h2 id={headingId} className="text-lg font-bold text-wf-navy">
          写真
          <RequiredMark>1 枚以上必須</RequiredMark>
        </h2>
        <p className="text-sm text-wf-text-mid">
          最大 {CASE_STUDY_PHOTOS_MAX} 枚。1 枚目がメインの写真になります。JPEG・PNG・HEIC、1 枚
          20MB まで（選ぶと自動で縮小して保存します）。
        </p>
      </div>

      {failures.length > 0 && (
        <ErrorNotice>
          <ul className="flex flex-col gap-1">
            {failures.map((failure) => (
              <li key={failure}>{failure}</li>
            ))}
          </ul>
        </ErrorNotice>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {photos.map((photo, index) => {
          const altError = altErrors[index]
          // 写真の基準パスは写真ごとに異なるため、要素の key と id に使う
          const key = photo.path.replaceAll('/', '-')
          const altId = `photo-alt-${key}`
          const altErrorId = `${altId}-error`
          const number = index + 1
          return (
            <div key={key} className="flex flex-col gap-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-wf-border">
                <img
                  src={photo.smallUrl}
                  alt=""
                  width={photo.width}
                  height={photo.height}
                  className="size-full object-cover"
                />
                <span className="absolute top-2 left-2 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-wf-navy">
                  {index === 0 ? 'メイン' : number}
                </span>
                <button
                  type="button"
                  aria-label={`${number} 枚目の写真を外す`}
                  onClick={() => onRemove(index)}
                  className="absolute top-2 right-2 flex size-9 items-center justify-center rounded-full bg-white text-wf-ink shadow-sm transition-colors hover:bg-wf-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wf-blue"
                >
                  <CloseIcon />
                </button>
              </div>
              <label htmlFor={altId} className="text-[13px] font-bold text-wf-navy">
                写真の説明<span className="sr-only">（{number} 枚目）</span>
              </label>
              <input
                id={altId}
                type="text"
                value={photo.alt}
                onChange={(event) => onAltChange(index, event.target.value)}
                aria-invalid={Boolean(altError)}
                aria-describedby={altError ? altErrorId : undefined}
                className={`${INPUT_CLASS} h-11 px-2.5 text-sm`}
              />
              {altError && (
                <p id={altErrorId} className="text-[13px] font-bold text-wf-danger">
                  {altError}
                </p>
              )}
            </div>
          )
        })}

        {Array.from({ length: processing }, (_, index) => (
          <div
            key={`processing-${index}`}
            className="flex aspect-[4/3] items-center justify-center rounded-lg bg-wf-surface text-sm text-wf-text-mid"
          >
            縮小しています…
          </div>
        ))}

        {remaining > 0 && (
          // 見た目は点線の枠のボタン。中の <input type="file"> は見えなくして、ラベルを押して選ぶ
          <label className="relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-wf-border bg-wf-surface text-[15px] font-bold text-wf-blue transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-wf-blue hover:bg-white">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            写真を追加
            <input
              type="file"
              accept={PHOTO_ACCEPT}
              multiple
              onChange={onChange}
              aria-describedby={error ? errorId : undefined}
              className="sr-only"
            />
          </label>
        )}
      </div>

      {processing > 0 && (
        <p role="status" className="text-sm text-wf-text-mid">
          写真を縮小してアップロードしています（残り {processing} 枚）。
        </p>
      )}

      {error && (
        <p id={errorId} className="text-sm font-bold text-wf-danger">
          {error}
        </p>
      )}
    </section>
  )
}
