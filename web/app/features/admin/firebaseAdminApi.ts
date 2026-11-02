import {
  CASE_STUDIES_COLLECTION,
  CASE_STUDY_IMAGE_SIZES,
  CASE_STUDY_STORAGE_ROOT,
  caseStudyContentSchema,
  caseStudyPhotoBasePath,
  caseStudyPhotoFilePath,
  type CaseStudyImageSize,
  type CaseStudyPhoto,
} from '@wf/shared'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  type DocumentSnapshot,
  type Firestore,
} from 'firebase/firestore'
import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  uploadBytes,
  type FirebaseStorage,
} from 'firebase/storage'
import type { AdminApi, AdminCaseStudy, AuthEvent, SignInResult } from './api'
import { signInErrorFromCode } from './signInErrors'

// 管理画面の操作（AdminApi）の Firebase での実装。
// 書き込みの形は firestore.rules・storage.rules に合わせる（tests/integration/caseStudyAdmin.test.ts で
// Emulator と本物のルールで確かめる）。結合テストから Node で読み込むため、エイリアス（~/）を使わない

export type AdminFirebaseServices = { auth: Auth; db: Firestore; storage: FirebaseStorage }

// アップロードした写真はファイル名（写真の ID）を変えずに上書きしないため、長くキャッシュさせる
const PHOTO_CACHE_CONTROL = 'public, max-age=31536000, immutable'

const errorCode = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
    ? error.code
    : undefined

// カスタムクレーム admin の有無。付けた直後でも反映されるよう、ID トークンを取り直して確かめる
const isAdminUser = async (user: User) => (await user.getIdTokenResult(true)).claims.admin === true

const toAdminCaseStudy = (snapshot: DocumentSnapshot): AdminCaseStudy | null => {
  const data = snapshot.data()
  const content = caseStudyContentSchema.safeParse(data)
  if (!content.success) {
    // ルールで検証して保存しているため通常は起きない
    console.warn(`施工事例 ${snapshot.id} の内容が正しくありません`, content.error.issues)
    return null
  }
  const updatedAt = data?.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null
  return { id: snapshot.id, ...content.data, updatedAt }
}

export function createFirebaseAdminApi({ auth, db, storage }: AdminFirebaseServices): AdminApi {
  const caseStudies = collection(db, CASE_STUDIES_COLLECTION)
  const caseStudyDoc = (id: string) => doc(caseStudies, id)
  // Firestore の自動 ID（英数字 20 文字）。Storage のパスにも使える（isStorageId）
  const newId = () => doc(caseStudies).id

  const currentUid = () => {
    const uid = auth.currentUser?.uid
    if (!uid) throw new Error('ログインしていません')
    return uid
  }

  const deleteFiles = async (paths: readonly string[]) => {
    const results = await Promise.allSettled(paths.map((path) => deleteObject(ref(storage, path))))
    const failures = results.flatMap((result) =>
      result.status === 'rejected' && errorCode(result.reason) !== 'storage/object-not-found'
        ? [result.reason]
        : [],
    )
    if (failures.length > 0) throw new AggregateError(failures, '写真を削除できませんでした')
  }

  const photoFilePaths = (basePaths: readonly string[]) =>
    basePaths.flatMap((basePath) =>
      CASE_STUDY_IMAGE_SIZES.map((size) => caseStudyPhotoFilePath(basePath, size)),
    )

  return {
    onAuthChange(listener) {
      // ログイン状態が続けて変わったときに、古い判定の結果で上書きしないようにする
      let latest = 0
      return onAuthStateChanged(auth, (user) => {
        const current = ++latest
        const emit = (event: AuthEvent) => {
          if (current === latest) listener(event)
        }
        if (!user) {
          emit({ type: 'signedOut' })
          return
        }
        isAdminUser(user)
          .then(async (admin) => {
            if (admin) {
              emit({ type: 'admin', user: { uid: user.uid, email: user.email ?? '' } })
              return
            }
            await signOut(auth)
            listener({ type: 'forbidden' })
          })
          .catch(() => emit({ type: 'signedOut' }))
      })
    },

    async signIn(email, password): Promise<SignInResult> {
      try {
        const { user } = await signInWithEmailAndPassword(auth, email, password)
        if (await isAdminUser(user)) return { ok: true }
        await signOut(auth)
        return { ok: false, error: 'forbidden' }
      } catch (error) {
        return { ok: false, error: signInErrorFromCode(errorCode(error)) }
      }
    },

    async signOut() {
      await signOut(auth)
    },

    newCaseStudyId: newId,

    async listCaseStudies() {
      const snapshot = await getDocs(caseStudies)
      return snapshot.docs.flatMap((item) => toAdminCaseStudy(item) ?? [])
    },

    async getCaseStudy(id) {
      const snapshot = await getDoc(caseStudyDoc(id))
      return snapshot.exists() ? toAdminCaseStudy(snapshot) : null
    },

    async saveCaseStudy({ id, isNew, values, status }) {
      const data = { ...values, status, updatedAt: serverTimestamp(), updatedBy: currentUid() }
      if (isNew) {
        await setDoc(caseStudyDoc(id), { ...data, createdAt: serverTimestamp() })
      } else {
        // createdAt はそのまま（ルールで変更を拒否する）
        await updateDoc(caseStudyDoc(id), data)
      }
    },

    async setStatus(id, status) {
      await updateDoc(caseStudyDoc(id), {
        status,
        updatedAt: serverTimestamp(),
        updatedBy: currentUid(),
      })
    },

    async deleteCaseStudy({ id, photos }) {
      await deleteDoc(caseStudyDoc(id))
      // 保存した写真に加え、保存せずに残った写真（アップロード後に画面を閉じた場合など）も消す
      const listed = await listAll(ref(storage, `${CASE_STUDY_STORAGE_ROOT}/${id}`))
      const paths = new Set([
        ...photoFilePaths(photos.map((photo) => photo.path)),
        ...listed.items.map((item) => item.fullPath),
      ])
      await deleteFiles([...paths])
    },

    async uploadPhoto(caseId, photo): Promise<CaseStudyPhoto> {
      // 基準パスの拡張子で形式が分かる（case-studies/{事例の ID}/{写真の ID}.{webp|jpg}）
      const basePath = caseStudyPhotoBasePath(caseId, newId(), photo.contentType)
      const upload = async (size: CaseStudyImageSize) => {
        const fileRef = ref(storage, caseStudyPhotoFilePath(basePath, size))
        await uploadBytes(fileRef, photo.files[size], {
          contentType: photo.contentType,
          cacheControl: PHOTO_CACHE_CONTROL,
        })
        return getDownloadURL(fileRef)
      }
      try {
        const [smallUrl, largeUrl] = await Promise.all([upload('small'), upload('large')])
        return {
          path: basePath,
          smallUrl,
          largeUrl,
          width: photo.width,
          height: photo.height,
          alt: '',
        }
      } catch (error) {
        // 片方だけ残らないようにする
        await deleteFiles(photoFilePaths([basePath])).catch(() => undefined)
        throw error
      }
    },

    async deletePhotos(paths) {
      await deleteFiles(photoFilePaths(paths))
    },
  }
}
