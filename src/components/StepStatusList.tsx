export interface StepStatus {
  step: string
  outcome: string
  /** done: handled fully (check mark). partial: handled in part (half marker). */
  state: 'done' | 'partial'
}

/**
 * A short status list: how each step was handled. Done steps get a check in the shipped green; partial
 * steps a half-filled marker. Evidence tier, reusable.
 */
export function StepStatusList({ items, label, className = '' }: { items: StepStatus[]; label: string; className?: string }) {
  return (
    <ul aria-label={label} className={`m-0 grid list-none gap-0 rounded-[14px] border border-hairline-strong bg-white/[0.04] p-0 ${className}`}>
      {items.map((it, i) => (
        <li
          key={it.step}
          className={`grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-[0.8em] px-[clamp(14px,calc(var(--u)*1.6),26px)] py-[clamp(12px,calc(var(--u)*1.3),22px)] ${i > 0 ? 'border-t border-hairline' : ''}`}
        >
          <Marker state={it.state} />
          <span className="flex flex-col gap-[0.15em]">
            <span className="text-[clamp(15px,calc(var(--u)*1.35),24px)] font-semibold leading-snug text-fg">{it.step}</span>
            <span className="text-[clamp(13px,calc(var(--u)*1.1),20px)] leading-snug text-fg-muted">
              <span className="sr-only">{it.state === 'done' ? 'Done: ' : 'Partly: '}</span>
              {it.outcome}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}

function Marker({ state }: { state: StepStatus['state'] }) {
  return (
    <svg viewBox="0 0 24 24" className="mt-[0.15em] block h-[clamp(18px,calc(var(--u)*1.6),28px)] w-[clamp(18px,calc(var(--u)*1.6),28px)] flex-none" aria-hidden="true">
      {state === 'done' ? (
        <>
          <circle cx="12" cy="12" r="11" fill="var(--color-shipped)" />
          <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="var(--color-card-to)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="10" fill="none" stroke="var(--color-caption)" strokeWidth="2" />
          <path d="M12 2a10 10 0 0 1 0 20z" fill="var(--color-caption)" />
        </>
      )}
    </svg>
  )
}
