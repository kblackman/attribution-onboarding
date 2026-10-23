export interface ComparisonSide {
  title: string
  items: string[]
}

/** Before/after pair, deck .cmp styling: the "after" column carries the accent. */
export function Comparison({ before, after, className = '' }: { before: ComparisonSide; after: ComparisonSide; className?: string }) {
  const col = (side: ComparisonSide, accent: boolean) => (
    <div className={`rounded-[14px] border p-[clamp(16px,calc(var(--u)*2),30px)] ${accent ? 'border-accent/50 bg-accent/5' : 'border-white/15 bg-white/[0.035]'}`}>
      <h3 className={`m-0 mb-[clamp(10px,calc(var(--u)*1.3),20px)] text-label font-normal uppercase ${accent ? 'text-accent' : 'text-fg-soft'}`}>{side.title}</h3>
      <ul className="m-0 grid list-none gap-[clamp(6px,calc(var(--u)*0.75),13px)] p-0">
        {side.items.map((it) => (
          <li key={it} className={`relative pl-5 text-body leading-snug ${accent ? 'text-fg' : 'text-fg-muted'}`}>
            <span className={`absolute left-0 top-[0.7em] block h-0.5 w-2.5 ${accent ? 'bg-accent' : 'bg-white/35'}`} aria-hidden="true" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  )
  return (
    <div className={`grid max-w-[1000px] grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-[clamp(16px,calc(var(--u)*3),48px)] ${className}`}>
      {col(before, false)}
      {col(after, true)}
    </div>
  )
}
