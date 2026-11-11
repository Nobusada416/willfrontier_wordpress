import { FadeUp } from '~/components/motion/FadeUp'
import { MoreLink } from '~/components/ui/MoreLink'
import { VEHICLE_SLIDES } from '~/content/home'
import { HomeSection } from './HomeSection'
import { VehicleSlider } from './VehicleSlider'

export function Vehicles() {
  return (
    <HomeSection
      id="vehicles"
      title="VEHICLE LINEUP"
      leaves="b"
      background={
        <img
          // 旧テーマ（P11 まで）は原寸の jpg を参照している。こちらは幅 1600px に縮小した webp を使う
          src="/media/images/車両-イラスト風.webp"
          alt=""
          width={1600}
          height={1075}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-10"
        />
      }
    >
      <FadeUp>
        <VehicleSlider slides={VEHICLE_SLIDES} />
      </FadeUp>

      <FadeUp className="mt-8 text-center">
        <MoreLink to="/vehicles/" context="VEHICLE LINEUP">
          もっと見る
        </MoreLink>
      </FadeUp>
    </HomeSection>
  )
}
