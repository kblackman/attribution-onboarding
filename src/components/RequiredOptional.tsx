interface RequiredOptionalProps {
  required: string[]
  optional: string[]
  requiredLabel?: string
  optionalLabel?: string
  className?: string
}

/**
 * Two columns: what's required, and what's optional. Required reads as solid and firm; optional reads as
 * lighter (dashed frame, muted). No yellow, so the card's one yellow moment stays free. Evidence tier;
 * reusable (it may come back in 04 Solution).
 */
export function RequiredOptional({ required, optional, requiredLabel = 'Required', optionalLabel = 'Optional', className = '' }: RequiredOptionalProps) {
  const col = (title: string, items: string[], firm: boolean) => (
    <div className={`rounded-[14px] p-[clamp(14px,calc(var(--u)*1.8),28px)] ${firm ? 'border border-hairline-strong bg-white/[0.06]' : 'border border-dashed border-hairline-strong'}`}>
      <h3 className={`m-0 mb-[clamp(10px,calc(var(--u)*1.2),18px)] text-label font-normal uppercase ${firm ? 'text-fg' : 'text-fg-soft'}`}>{title}</h3>
      <ul className="m-0 grid list-none gap-[clamp(8px,calc(var(--u)*0.9),14px)] p-0">
        {items.map((it) => (
          <li key={it} className={`flex items-center gap-[0.6em] text-[clamp(15px,calc(var(--u)*1.35),24px)] leading-snug ${firm ? 'font-semibold text-fg' : 'text-fg-muted'}`}>
            <span
              className={`block h-[0.6em] w-[0.6em] flex-none rounded-full ${firm ? 'bg-fg' : 'border border-fg-soft'}`}
              aria-hidden="true"
            />
            {it}
          </li>
        ))}
      </ul>
    </div>
  )
  return (
    <div className={`grid grid-cols-2 gap-[clamp(10px,calc(var(--u)*1.4),22px)] ${className}`}>
      {col(requiredLabel, required, true)}
      {col(optionalLabel, optional, false)}
    </div>
  )
}
