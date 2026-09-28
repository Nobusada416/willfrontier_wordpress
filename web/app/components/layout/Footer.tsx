import { Link } from 'react-router'
import { CONTACT_LINK, FOOTER_NAV } from '~/content/navigation'
import { SITE } from '~/content/site'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="w-full bg-wf-navy text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 py-8 md:px-12 lg:h-header lg:flex-row lg:justify-between lg:py-0">
        <Logo />

        <nav aria-label="フッターナビ">
          <ul className="flex flex-wrap justify-center gap-x-10 gap-y-3">
            {FOOTER_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className="text-[13px] font-bold tracking-[.12em] opacity-90 transition-opacity hover:opacity-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          to={CONTACT_LINK.href}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-white bg-wf-blue px-7 py-2.5 text-[13px] font-bold tracking-[.12em] transition-opacity hover:opacity-80"
        >
          <span aria-hidden="true" className="text-[22px] leading-none font-thin">
            &gt;
          </span>
          {CONTACT_LINK.label}
        </Link>
      </div>
      {/* 旧実装の opacity-70 は背景の wf-navy とのコントラストが 4.35:1 で AA に届かないため 85% にした */}
      <p className="pb-4 text-center text-xs opacity-85">
        <small>© {SITE.legalName}</small>
      </p>
    </footer>
  )
}
