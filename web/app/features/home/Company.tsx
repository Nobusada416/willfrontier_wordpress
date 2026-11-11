import type { ReactNode } from 'react'
import { FadeUp } from '~/components/motion/FadeUp'
import { COMPANY_PROFILE, OFFICES } from '~/content/company'
import { HomeSection } from './HomeSection'

// 項目の下の破線（旧デザインの 20px 描いて 16px 空ける線）
const DASHED =
  'bg-[repeating-linear-gradient(to_right,var(--color-wf-blue)_0,var(--color-wf-blue)_20px,transparent_20px,transparent_36px)] bg-bottom bg-no-repeat [background-size:100%_1px]'

function Row({
  term,
  children,
  last = false,
}: {
  term: string
  children: ReactNode
  last?: boolean
}) {
  return (
    <FadeUp className={`flex flex-col gap-2 py-5 md:flex-row md:items-start ${last ? '' : DASHED}`}>
      <dt
        lang="en"
        className="shrink-0 text-base font-bold font-en tracking-[.12em] text-wf-blue md:w-[280px] md:text-lg lg:max-xl:w-[200px] lg:max-xl:text-sm"
      >
        {term}
      </dt>
      <dd className="text-lg font-bold tracking-wide text-wf-navy md:text-xl lg:max-xl:text-base">
        {children}
      </dd>
    </FadeUp>
  )
}

export function Company() {
  const lastIndex = COMPANY_PROFILE.after.length - 1
  return (
    <HomeSection
      id="company"
      title="COMPANY"
      leaves="b"
      underline={false}
      background={
        <img
          // 旧テーマ（P11 まで）は原寸の jpg を参照している。こちらは幅 1600px に縮小した webp を使う
          src="/media/images/横浜全景-イラスト風.webp"
          alt=""
          width={1600}
          height={1044}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-10"
        />
      }
    >
      {/* 旧実装は項目ごとに別々の <dl> だったため、1 つの定義リストにまとめる */}
      <dl className="mx-auto max-w-5xl border-t-[1.5px] border-wf-blue">
        {COMPANY_PROFILE.before.map((item) => (
          <Row key={item.term} term={item.term}>
            {item.detail}
          </Row>
        ))}
        <Row term="ADDRESS">
          <div className="space-y-5 leading-loose">
            {OFFICES.map((office) => (
              <div key={office.name}>
                <p className="mb-1 w-[140px] bg-wf-blue py-2 text-center text-base tracking-wider text-white">
                  {office.name}
                </p>
                <p>
                  〒{office.postalCode} {office.address}
                </p>
                <p>
                  TEL <a href={`tel:${office.tel}`}>{office.tel}</a>
                  {`\u3000FAX ${office.fax}`}
                </p>
                {office.mail && (
                  <p>
                    {'MAIL\u3000'}
                    <a
                      href={`mailto:${office.mail}`}
                      className="break-all underline-offset-4 hover:underline"
                    >
                      {office.mail}
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>
        </Row>
        {COMPANY_PROFILE.after.map((item, index) => (
          <Row key={item.term} term={item.term} last={index === lastIndex}>
            {item.detail}
          </Row>
        ))}
      </dl>
    </HomeSection>
  )
}
