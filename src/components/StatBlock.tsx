export interface Stat {
  value: string
  label: string
}

/** Case study stat row: light numerals over uppercase labels, split by hairlines. */
export function StatBlock({ stats, className = '' }: { stats: Stat[]; className?: string }) {
  return (
    <dl className={`m-0 grid grid-cols-2 gap-6 sm:flex sm:gap-0 ${className}`}>
      {stats.map((s, i) => (
        <div key={s.label} className={`flex flex-col-reverse gap-2 sm:px-[clamp(20px,calc(var(--u)*3),56px)] ${i === 0 ? 'sm:pl-0' : 'sm:border-l sm:border-hairline'}`}>
          <dt className="text-label uppercase text-fg-soft">{s.label}</dt>
          <dd className="m-0 text-stat font-light tabular-nums text-fg">{s.value}</dd>
        </div>
      ))}
    </dl>
  )
}
