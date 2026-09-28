import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router'
import { CONTACT_LINK, GLOBAL_NAV } from '~/content/navigation'
import { Logo } from './Logo'
import { MobileNav } from './MobileNav'

// PC 表示（lg 以上）ではナビを横並びで表示し、それ未満ではハンバーガーメニューにする
// 旧実装はスマホでもナビを横並びのまま表示しており、画面からはみ出していた
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  // 閉じたあとにメニューボタンへフォーカスを戻すか
  const returnFocusRef = useRef(false)

  const closeMenu = useCallback((reason: 'dismiss' | 'navigate') => {
    returnFocusRef.current = reason === 'dismiss'
    setMenuOpen(false)
  }, [])

  // メニューが閉じて背面の inert が解除されてから（MobileNav のクリーンアップ後に）フォーカスを戻す
  useEffect(() => {
    if (menuOpen || !returnFocusRef.current) return
    returnFocusRef.current = false
    menuButtonRef.current?.focus()
  }, [menuOpen])

  // メニューを開いたまま PC 幅に広げた場合は閉じる（スクロール停止が残らないように）
  useEffect(() => {
    if (!menuOpen || typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(min-width: 1024px)')
    const onChange = () => {
      if (query.matches) closeMenu('dismiss')
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [menuOpen, closeMenu])

  return (
    <header className="sticky top-0 z-(--z-header) w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-header max-w-7xl items-center justify-between px-6 md:px-12">
        <Logo />

        <nav aria-label="グローバルナビ" className="hidden lg:block">
          <ul className="flex items-center gap-10">
            {GLOBAL_NAV.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className="font-bold tracking-[.12em] text-wf-navy transition-opacity hover:opacity-60 aria-[current=page]:text-wf-blue"
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          to={CONTACT_LINK.href}
          className="hidden shrink-0 items-center gap-1.5 rounded bg-wf-blue px-6 py-2.5 text-[13px] font-bold tracking-[.12em] text-white transition-colors hover:bg-wf-blue-hover lg:inline-flex"
        >
          <span aria-hidden="true" className="text-[15px] font-black">
            &gt;
          </span>
          {CONTACT_LINK.label}
        </Link>

        <button
          ref={menuButtonRef}
          type="button"
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? menuId : undefined}
          onClick={() => setMenuOpen(true)}
          className="grid size-11 place-items-center rounded text-wf-navy lg:hidden"
        >
          <span className="sr-only">メニュー</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-7" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </div>

      {menuOpen && <MobileNav id={menuId} onClose={closeMenu} />}
    </header>
  )
}
