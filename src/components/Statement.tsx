import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

interface StatementProps {
  headline: string
  /** One paragraph as a string, or several <p> elements. */
  body: ReactNode
  /** Text-heavy beats: a wider measure (64ch instead of 46ch). Pair with the beat's cardDense. */
  wide?: boolean
  /** Center the headline and body (default left, the Story tier). */
  align?: 'left' | 'center'
}

/**
 * Story tier content: every narrative beat uses this, so headlines, body size, measure, and spacing match
 * from beat to beat. The beat's punchline doesn't live here: give it the Moments treatment as a
 * cardOverlay with SpotlightLine.
 */
export function Statement({ headline, body, wide = false, align = 'left' }: StatementProps) {
  const center = align === 'center'
  return (
    <div className={`flex flex-col ${center ? 'items-center text-center' : ''}`}>
      <Reveal as="h2" className="m-0 text-story font-extrabold">
        {headline}
      </Reveal>
      <Reveal
        order={1}
        className={`mt-[clamp(18px,calc(var(--u)*2.6),46px)] flex flex-col gap-[0.65em] text-statement text-fg-muted text-pretty sm:gap-[0.8em] [&_p]:m-0 ${wide ? 'max-w-[64ch]' : 'max-w-[46ch]'}`}
      >
        {typeof body === 'string' ? <p>{body}</p> : body}
      </Reveal>
    </div>
  )
}
