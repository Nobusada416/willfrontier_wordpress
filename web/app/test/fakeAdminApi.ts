import type { CaseStudyPhoto } from '@wf/shared'
import { vi } from 'vitest'
import type { AdminApi, AdminCaseStudy, AuthEvent } from '~/features/admin/api'

// 管理画面のテスト用の偽の AdminApi。データはメモリに持ち、各メソッドは vi.fn で呼び出しを確かめられる

export const makePhoto = (caseId: string, n: number, alt = ''): CaseStudyPhoto => ({
  path: `case-studies/${caseId}/photo${n}`,
  smallUrl: `https://storage.example.com/${caseId}/photo${n}-small.webp`,
  largeUrl: `https://storage.example.com/${caseId}/photo${n}-large.webp`,
  width: 1600,
  height: 1200,
  alt,
})

let sequence = 0

export const makeCaseStudy = (overrides: Partial<AdminCaseStudy> = {}): AdminCaseStudy => {
  sequence += 1
  const id = overrides.id ?? `case${sequence}`
  return {
    id,
    status: 'draft',
    date: '2026-08-12',
    tag: '定期回収',
    company: '株式会社テスト',
    title: `事例 ${sequence}`,
    category: '産業廃棄物 / 金属類',
    description: '本文です。',
    photos: [makePhoto(id, 1, '現場の写真')],
    updatedAt: null,
    ...overrides,
  }
}

export const createFakeAdminApi = (initial: AdminCaseStudy[] = []) => {
  const store = new Map(initial.map((item) => [item.id, item]))
  const listeners = new Set<(event: AuthEvent) => void>()
  let uploads = 0

  const api = {
    store,
    emit: (event: AuthEvent) => listeners.forEach((listener) => listener(event)),
    onAuthChange: vi.fn((listener: (event: AuthEvent) => void) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    }),
    signIn: vi.fn<AdminApi['signIn']>(async () => ({ ok: true })),
    signOut: vi.fn<AdminApi['signOut']>(async () => undefined),
    newCaseStudyId: vi.fn(() => 'newCase'),
    listCaseStudies: vi.fn<AdminApi['listCaseStudies']>(async () => [...store.values()]),
    getCaseStudy: vi.fn<AdminApi['getCaseStudy']>(async (id) => store.get(id) ?? null),
    saveCaseStudy: vi.fn<AdminApi['saveCaseStudy']>(async ({ id, values, status }) => {
      store.set(id, { id, ...values, status, updatedAt: new Date() })
    }),
    setStatus: vi.fn<AdminApi['setStatus']>(async (id, status) => {
      const item = store.get(id)
      if (item) store.set(id, { ...item, status })
    }),
    deleteCaseStudy: vi.fn<AdminApi['deleteCaseStudy']>(async ({ id }) => {
      store.delete(id)
    }),
    uploadPhoto: vi.fn<AdminApi['uploadPhoto']>(async (caseId) => {
      uploads += 1
      return { ...makePhoto(caseId, 100 + uploads), alt: '' }
    }),
    deletePhotos: vi.fn<AdminApi['deletePhotos']>(async () => undefined),
  }
  return api satisfies AdminApi & Record<string, unknown>
}

export type FakeAdminApi = ReturnType<typeof createFakeAdminApi>
