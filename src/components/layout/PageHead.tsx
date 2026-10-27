import { ChevronBand } from '../brand/ChevronBand'
import { RoadScene } from '../brand/RoadScene'

// Dark road band at the top of inner pages; the glass header sits over it.
export function PageHead({ title, intro }: { title: string; intro?: string }) {
  return (
    <section className="relative overflow-hidden bg-road text-cab">
      <RoadScene variant="band" />
      <div className="relative mx-auto max-w-[1280px] px-4 pb-14 pt-28 min-[900px]:px-12 min-[900px]:pb-20 min-[900px]:pt-[124px]">
        <h1 className="font-display text-[44px] font-bold leading-none min-[900px]:text-[60px]">{title}</h1>
        {intro && <p className="mt-4 max-w-[720px] text-lg leading-relaxed text-muted-dark-2 min-[900px]:text-[19px]">{intro}</p>}
      </div>
      <ChevronBand />
    </section>
  )
}
