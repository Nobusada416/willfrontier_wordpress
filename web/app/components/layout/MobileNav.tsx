import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { NavLink } from 'react-router'
import { CONTACT_LINK, GLOBAL_NAV } from '~/content/navigation'

type Props = {
  id: string
  // 閉じる理由。'dismiss'（Esc・閉じるボタン）のときだけメニューボタンにフォーカスを戻す
  onClose: (reason: 'dismiss' | 'navigate') => void
}

const FOCUSABLE = 'a[href], button:not([disabled])'

// スマホ表示のメニュー（lg 未満）。開いている間だけ描画するモーダル
// 背面を inert にできるよう、<body> の直下にポータルで描画する（閉じている間は描画しないため prerender には影響しない）
export function MobileNav({ id, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // 開いた直後は閉じるボタンにフォーカスを移す
  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  // 背面のページがスクロールしないようにする
  useEffect(() => {
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
    }
  }, [])

  // 背面（ヘッダー・本文・フッター）を操作・読み上げの対象から外す
  // Tab キーを使わないタッチ端末のスクリーンリーダーは、下のフォーカストラップだけでは背面に移動できてしまうため
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const siblings = [...document.body.children].filter(
      (element) => element !== panel && !element.hasAttribute('inert'),
    )
    for (const element of siblings) element.setAttribute('inert', '')
    return () => {
      for (const element of siblings) element.removeAttribute('inert')
    }
  }, [])

  // Esc で閉じ、Tab 移動はメニュー内で循環させる（フォーカストラップ）
  // フォーカスがどこにあっても効くよう document で受ける
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose('dismiss')
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return

      const focusables = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (!first || !last) return

      const inside = panelRef.current.contains(document.activeElement)
      if (event.shiftKey && (document.activeElement === first || !inside)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !inside)) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return createPortal(
    <div
      ref={panelRef}
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label="メニュー"
      className="fixed inset-0 z-(--z-menu) flex flex-col bg-white lg:hidden"
    >
      <div className="flex h-header items-center justify-end border-b border-gray-200 px-6">
        <button
          ref={closeButtonRef}
          type="button"
          onClick={() => onClose('dismiss')}
          className="grid size-11 place-items-center rounded text-wf-navy"
        >
          <span className="sr-only">メニューを閉じる</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-7" fill="none">
            <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </div>

      <nav aria-label="スマホ用メニュー" className="flex-1 overflow-y-auto px-6 py-8">
        <ul className="flex flex-col">
          {GLOBAL_NAV.map((item) => (
            <li key={item.href} className="border-b border-wf-border">
              <NavLink
                to={item.href}
                onClick={() => onClose('navigate')}
                className="block py-4 text-lg font-bold tracking-[.12em] text-wf-navy aria-[current=page]:text-wf-blue"
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <NavLink
          to={CONTACT_LINK.href}
          onClick={() => onClose('navigate')}
          className="mt-10 flex items-center justify-center rounded bg-wf-blue py-4 font-bold tracking-[.12em] text-white"
        >
          {CONTACT_LINK.label}
        </NavLink>
      </nav>
    </div>,
    document.body,
  )
}
