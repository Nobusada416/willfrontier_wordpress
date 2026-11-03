import type { CaseStudy } from '@wf/shared'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchPublishedCaseStudies } from './caseStudies'
import { useCaseStudies } from './useCaseStudies'

vi.mock('./caseStudies', () => ({ fetchPublishedCaseStudies: vi.fn() }))

const fetchMock = vi.mocked(fetchPublishedCaseStudies)

const study = (id: string): CaseStudy => ({
  id,
  status: 'published',
  date: '2026-04-01',
  tag: '運用開始',
  company: '株式会社テスト',
  title: `事例 ${id}`,
  category: '産業廃棄物',
  description: '本文',
  photos: [
    {
      path: `case-studies/${id}/photo`,
      smallUrl: 'https://example.com/s.webp',
      largeUrl: 'https://example.com/l.webp',
      width: 1600,
      height: 1200,
      alt: '',
    },
  ],
})

// 外から完了・失敗させられる Promise
const deferred = <T>() => {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

beforeEach(() => {
  fetchMock.mockReset()
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useCaseStudies', () => {
  it('読み込み中 → 成功（事例の一覧）', async () => {
    const request = deferred<CaseStudy[]>()
    fetchMock.mockReturnValue(request.promise)
    const { result } = renderHook(() => useCaseStudies({ limit: 4 }))

    expect(result.current.state).toEqual({ status: 'loading' })
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.objectContaining({ env: import.meta.env, limit: 4 }),
      ),
    )

    await act(async () => request.resolve([study('a'), study('b')]))
    expect(result.current.state).toEqual({
      status: 'success',
      caseStudies: [study('a'), study('b')],
    })
  })

  it('0 件なら empty', async () => {
    fetchMock.mockResolvedValue([])
    const { result } = renderHook(() => useCaseStudies())
    await waitFor(() => expect(result.current.state).toEqual({ status: 'empty' }))
  })

  it('失敗したら error。再読み込みで読み込み中に戻り、やり直す', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network'))
    const { result } = renderHook(() => useCaseStudies())
    await waitFor(() => expect(result.current.state).toEqual({ status: 'error' }))

    const retry = deferred<CaseStudy[]>()
    fetchMock.mockReturnValueOnce(retry.promise)
    act(() => result.current.reload())
    expect(result.current.state).toEqual({ status: 'loading' })
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))

    await act(async () => retry.resolve([study('a')]))
    expect(result.current.state).toEqual({ status: 'success', caseStudies: [study('a')] })
  })

  it('enabled が false の間は読み込まず、true になったら読み込む', async () => {
    fetchMock.mockResolvedValue([study('a')])
    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useCaseStudies({ enabled }),
      { initialProps: { enabled: false } },
    )
    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.current.state).toEqual({ status: 'loading' })

    rerender({ enabled: true })
    await waitFor(() => expect(result.current.state.status).toBe('success'))
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('アンマウントしたら読み込みを中断し、結果を反映しない', async () => {
    const request = deferred<CaseStudy[]>()
    fetchMock.mockReturnValue(request.promise)
    const { unmount } = renderHook(() => useCaseStudies())
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const signal = fetchMock.mock.calls[0]?.[0]?.signal
    unmount()
    expect(signal?.aborted).toBe(true)
    await act(async () => request.reject(new DOMException('aborted', 'AbortError')))
  })
})
