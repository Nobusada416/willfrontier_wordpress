import { zodResolver } from '@hookform/resolvers/zod'
import {
  CASE_STUDY_MAX_LENGTH,
  CASE_STUDY_PHOTOS_MAX,
  caseStudyFormSchema,
  type CaseStudyFormInput,
  type CaseStudyFormValues,
  type CaseStudyPhoto,
  type CaseStudyStatus,
} from '@wf/shared'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useBlocker, useNavigate } from 'react-router'
import { getAdminPage } from '~/content/pages'
import { useAdminApi, type AdminCaseStudy } from './api'
import { PhotoField } from './PhotoField'
import { PhotoError, processPhotoFile } from './photos'
import {
  BUTTON_CLASS,
  ConfirmDialog,
  ErrorNotice,
  Field,
  INPUT_CLASS,
  LINK_CLASS,
  StatusBadge,
  type ListNoticeState,
} from './ui'

type CaseStudyEditorProps = {
  // 事例の ID。新規作成でも写真のアップロード先に使うため、先に決めて渡す
  caseId: string
  // 保存済みの事例（新規作成は null）
  initial: AdminCaseStudy | null
}

const LIST_PATH = getAdminPage('admin').path

// 今日の日付（YYYY-MM-DD。利用者の地域の日付）
const today = () => {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

const toFormInput = (initial: AdminCaseStudy | null): CaseStudyFormInput =>
  initial
    ? {
        date: initial.date,
        tag: initial.tag,
        company: initial.company,
        title: initial.title,
        category: initial.category,
        description: initial.description,
        photos: initial.photos.map((photo) => ({ ...photo })),
      }
    : { date: today(), tag: '', company: '', title: '', category: '', description: '', photos: [] }

const savedMessage = (title: string, status: CaseStudyStatus) =>
  status === 'published'
    ? `「${title}」を公開しました。サイトにすぐ反映されます。`
    : `「${title}」を下書きとして保存しました。サイトには表示されません。`

const UPLOAD_FAILED = 'アップロードできませんでした。通信状態を確かめて、もう一度お試しください。'

// ③ 施工事例の編集（新規作成・既存の編集）
export function CaseStudyEditor({ caseId, initial }: CaseStudyEditorProps) {
  const api = useAdminApi()
  const navigate = useNavigate()
  const isNew = initial === null

  const form = useForm<CaseStudyFormInput, unknown, CaseStudyFormValues>({
    resolver: zodResolver(caseStudyFormSchema),
    defaultValues: toFormInput(initial),
  })
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = form

  // 写真（説明を含む）は画面の状態で持ち、変わるたびにフォームの値（photos）へ写す。
  // react-hook-form の useFieldArray・useWatch は公開ページのフォームと共有するチャンクを大きくするため使わない
  const [photos, setPhotos] = useState<CaseStudyPhoto[]>(() => initial?.photos ?? [])
  // 写真の追加は非同期で 1 枚ずつ行うため、最新の一覧を ref でも持つ
  const photosRef = useRef(photos)
  const updatePhotos = (next: CaseStudyPhoto[]) => {
    photosRef.current = next
    setPhotos(next)
    form.setValue('photos', next, {
      shouldDirty: true,
      // 一度保存を押した後は、変えるたびに検証し直してエラーを消す
      shouldValidate: form.formState.isSubmitted,
    })
  }
  // 本文の文字数
  const [descriptionLength, setDescriptionLength] = useState(initial?.description.length ?? 0)

  const [processing, setProcessing] = useState(0)
  const [photoFailures, setPhotoFailures] = useState<string[]>([])
  const [actionError, setActionError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // この画面でアップロードし、まだ保存していない写真（外したときや保存せずに離れたときに Storage から消す）
  const sessionUploads = useRef(new Set<string>())
  // 保存・削除のあとの移動では確認を出さない
  const leaving = useRef(false)

  const hasChanges = isDirty || processing > 0
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasChanges && !leaving.current && currentLocation.pathname !== nextLocation.pathname,
  )

  // ページの再読み込み・タブを閉じるときはブラウザの確認を出す
  useEffect(() => {
    if (!hasChanges) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [hasChanges])

  // 保存せずに画面を離れたら、この画面でアップロードした写真を消す（失敗しても画面の操作は止めない）
  useEffect(() => {
    const uploads = sessionUploads.current
    return () => {
      if (leaving.current || uploads.size === 0) return
      api.deletePhotos([...uploads]).catch(() => undefined)
    }
  }, [api])

  const addPhotos = async (files: File[]) => {
    const room = CASE_STUDY_PHOTOS_MAX - photosRef.current.length - processing
    const accepted = files.slice(0, Math.max(0, room))
    const failures: string[] =
      files.length > accepted.length ? [`写真は ${CASE_STUDY_PHOTOS_MAX} 枚までです。`] : []
    setPhotoFailures(failures)
    setProcessing((count) => count + accepted.length)
    // 1 枚目がメインになるよう、選んだ順に 1 枚ずつ処理する
    for (const file of accepted) {
      try {
        const processed = await processPhotoFile(file)
        const photo = await api.uploadPhoto(caseId, processed).catch((error: unknown) => {
          console.error('写真をアップロードできませんでした', error)
          throw new PhotoError(UPLOAD_FAILED)
        })
        sessionUploads.current.add(photo.path)
        updatePhotos([...photosRef.current, photo])
      } catch (error) {
        const message = error instanceof PhotoError ? error.message : UPLOAD_FAILED
        failures.push(`「${file.name}」: ${message}`)
        setPhotoFailures([...failures])
      } finally {
        setProcessing((count) => count - 1)
      }
    }
  }

  const removePhoto = (index: number) => {
    const path = photosRef.current[index]?.path
    updatePhotos(photosRef.current.filter((_, other) => other !== index))
    // 保存済みの写真は、保存が終わってから消す（保存をやめたときに、公開中の事例の写真が壊れないように）
    if (path && sessionUploads.current.delete(path)) {
      api.deletePhotos([path]).catch(() => undefined)
    }
  }

  const save = (status: CaseStudyStatus) =>
    handleSubmit(async (values) => {
      setActionError(null)
      try {
        await api.saveCaseStudy({ id: caseId, isNew, values, status })
      } catch (error) {
        console.error('施工事例を保存できませんでした', error)
        setActionError('保存できませんでした。通信状態を確かめて、もう一度お試しください。')
        return
      }
      const kept = new Set(values.photos.map((photo) => photo.path))
      const removed = (initial?.photos ?? [])
        .map((photo) => photo.path)
        .filter((path) => !kept.has(path))
      if (removed.length > 0) {
        // 消せなくても保存はできている（ファイルが残るだけ）ため、利用者には知らせない
        await api.deletePhotos(removed).catch((error: unknown) => {
          console.error('外した写真を削除できませんでした', error)
        })
      }
      leaving.current = true
      navigate(LIST_PATH, {
        state: { notice: savedMessage(values.title, status) } satisfies ListNoticeState,
      })
    })

  const deleteCaseStudy = async () => {
    if (!initial) return
    setDeleting(true)
    setActionError(null)
    try {
      await api.deleteCaseStudy({ id: initial.id, photos: initial.photos })
    } catch (error) {
      console.error('施工事例を削除できませんでした', error)
      setDeleting(false)
      setConfirmDelete(false)
      setActionError('削除できませんでした。通信状態を確かめて、もう一度お試しください。')
      return
    }
    leaving.current = true
    navigate(LIST_PATH, {
      state: { notice: `「${initial.title}」を削除しました。` } satisfies ListNoticeState,
    })
  }

  const changeAlt = (index: number, alt: string) => {
    updatePhotos(
      photosRef.current.map((photo, other) => (other === index ? { ...photo, alt } : photo)),
    )
  }

  const photoErrors = errors.photos
  const busy = isSubmitting || deleting
  const savingBlocked = busy || processing > 0

  return (
    <main className="mx-auto flex max-w-[880px] flex-col gap-6 px-4 pt-8 pb-16 sm:px-6">
      <Link
        to={LIST_PATH}
        className={`inline-flex items-center gap-1.5 self-start text-[15px] ${LINK_CLASS}`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M15 6l-6 6 6 6" />
        </svg>
        一覧に戻る
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-[26px] font-bold text-wf-navy">
          {isNew ? '施工事例の新規作成' : '施工事例の編集'}
        </h1>
        {initial && <StatusBadge status={initial.status} />}
      </div>

      <form
        noValidate
        aria-label="施工事例"
        onSubmit={(event) => void save('draft')(event)}
        className="flex flex-col gap-6"
      >
        <section
          aria-labelledby="basic-heading"
          className="flex flex-col gap-5 rounded-xl border border-wf-border bg-white p-5 sm:p-7"
        >
          <h2 id="basic-heading" className="text-lg font-bold text-wf-navy">
            基本情報
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="日付" required error={errors.date?.message}>
              {(props) => (
                <input {...props} type="date" {...register('date')} className={INPUT_CLASS} />
              )}
            </Field>
            <Field label="分類（トップに表示）" required error={errors.tag?.message}>
              {(props) => (
                <input
                  {...props}
                  type="text"
                  maxLength={CASE_STUDY_MAX_LENGTH.tag}
                  {...register('tag')}
                  className={INPUT_CLASS}
                />
              )}
            </Field>
          </div>
          <Field label="社名" required error={errors.company?.message}>
            {(props) => (
              <input
                {...props}
                type="text"
                maxLength={CASE_STUDY_MAX_LENGTH.company}
                {...register('company')}
                className={INPUT_CLASS}
              />
            )}
          </Field>
          <Field label="タイトル" required error={errors.title?.message}>
            {(props) => (
              <input
                {...props}
                type="text"
                maxLength={CASE_STUDY_MAX_LENGTH.title}
                {...register('title')}
                className={INPUT_CLASS}
              />
            )}
          </Field>
          <Field
            label="工事の種類・内容（タイトルの下に表示）"
            required
            error={errors.category?.message}
          >
            {(props) => (
              <input
                {...props}
                type="text"
                maxLength={CASE_STUDY_MAX_LENGTH.category}
                {...register('category')}
                className={INPUT_CLASS}
              />
            )}
          </Field>
          <Field
            label="本文"
            required
            error={errors.description?.message}
            hint={`${descriptionLength} / ${CASE_STUDY_MAX_LENGTH.description} 文字`}
          >
            {(props) => (
              <textarea
                {...props}
                rows={6}
                {...register('description', {
                  onChange: (event: { target: { value: string } }) =>
                    setDescriptionLength(event.target.value.length),
                })}
                className={`${INPUT_CLASS} h-auto resize-y py-3 leading-[1.7]`}
              />
            )}
          </Field>
        </section>

        <PhotoField
          photos={photos}
          onAltChange={changeAlt}
          altErrors={photos.map((_, index) => photoErrors?.[index]?.alt?.message)}
          error={photoErrors?.message ?? photoErrors?.root?.message}
          processing={processing}
          failures={photoFailures}
          onAdd={(files) => void addPhotos(files)}
          onRemove={removePhoto}
        />

        {actionError && <ErrorNotice>{actionError}</ErrorNotice>}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {initial ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmDelete(true)}
              className={`h-12 px-5 text-[15px] ${BUTTON_CLASS.danger}`}
            >
              削除
            </button>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={savingBlocked}
              className={`h-[52px] px-6 text-base ${BUTTON_CLASS.secondary}`}
            >
              下書き保存
            </button>
            <button
              type="button"
              disabled={savingBlocked}
              onClick={(event) => void save('published')(event)}
              className={`h-[52px] px-7 text-base ${BUTTON_CLASS.primary}`}
            >
              公開して保存
            </button>
          </div>
        </div>
      </form>

      {confirmDelete && initial && (
        <ConfirmDialog
          title="この施工事例を削除しますか？"
          cancelLabel="やめる"
          confirmLabel={deleting ? '削除しています…' : '削除する'}
          danger
          busy={deleting}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => void deleteCaseStudy()}
        >
          「{initial.title}」と写真 {initial.photos.length} 枚を削除します。元に戻せません。
        </ConfirmDialog>
      )}

      {blocker.state === 'blocked' && (
        <ConfirmDialog
          title="保存していない変更があります"
          cancelLabel="このページに残る"
          confirmLabel="保存せずに離れる"
          onCancel={() => blocker.reset()}
          onConfirm={() => blocker.proceed()}
        >
          このページを離れると、入力した内容は保存されません。
        </ConfirmDialog>
      )}
    </main>
  )
}
