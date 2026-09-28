import { Link } from 'react-router'
import { FadeUp } from '~/components/motion/FadeUp'
import { SectionHeader } from './SectionHeader'

type ContactCtaProps = {
  // ページごとの呼びかけ（「サービスのご相談はこちら」など）
  title: string
  className?: string
}

// 下層ページ末尾のお問い合わせへの誘導（旧実装ではページごとにインライン style で重複していた）
// 旧実装の見出しは h3 だったが、ページの見出し構造に合わせて h2 にした
export function ContactCta({ title, className = 'bg-white' }: ContactCtaProps) {
  return (
    <section
      aria-labelledby="contact-cta-heading"
      className={`relative isolate w-full py-[clamp(48px,6vw,96px)] text-center ${className}`}
    >
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeader id="contact-cta-heading" eyebrow="CONTACT" className="mb-8" size="md">
          {title}
        </SectionHeader>
        <FadeUp>
          <Link
            to="/contact/"
            className="inline-flex items-center gap-3 rounded-full bg-wf-orange px-10 py-[18px] text-[1.2rem] font-black tracking-[0.1em] text-white transition-colors hover:bg-wf-orange-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wf-orange sm:px-14"
          >
            お問い合わせ
            <span aria-hidden="true">▼</span>
          </Link>
        </FadeUp>
      </div>
    </section>
  )
}
