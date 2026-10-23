import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

interface StatementProps {
  headline: string
  body: ReactNode
  /** Optional accent line that lands on the next key press. The beat needs cardSteps: 2. */
  kicker?: ReactNode
}

/**
 * Content for the statement variant (Beat variant: 'statement'): a large headline, body set larger than
 * a card's, and an optional accent kicker on the next press. For problem statements and other emphasis beats.
 */
export function Statement({ headline, body, kicker }: StatementProps) {
  return (
    <div className="flex flex-col">
      <Reveal as="h2" className="m-0 text-display font-extrabold">
        {headline}
      </Reveal>
      <Reveal as="p" order={1} className="m-0 mt-[clamp(20px,calc(var(--u)*3),52px)] max-w-[46ch] text-statement text-fg-muted text-pretty">
        {body}
      </Reveal>
      {kicker && (
        <Reveal as="p" step={1} className="m-0 mt-[clamp(24px,calc(var(--u)*3.4),60px)] flex max-w-[34ch] gap-[clamp(14px,calc(var(--u)*1.6),26px)] text-kicker font-semibold text-accent text-pretty">
          <span className="mt-[0.62em] block h-0.5 w-[clamp(22px,calc(var(--u)*2.6),44px)] flex-none bg-accent" aria-hidden="true" />
          <span>{kicker}</span>
        </Reveal>
      )}
    </div>
  )
}
