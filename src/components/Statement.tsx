import { isValidElement, type ReactNode } from 'react'
import { Reveal } from './Reveal'
import { BulletItem, BulletList } from './Bullets'
import { usePresentMode } from '../engine/presentMode'

interface StatementProps {
  headline: string
  /** One paragraph as a string, or several <p> elements. */
  body: ReactNode
  /** Text-heavy beats: a wider measure (64ch instead of 46ch). Pair with the beat's cardDense. */
  wide?: boolean
  /** Center the headline and body (default left, the Story tier). */
  align?: 'left' | 'center'
  /** Present mode's short version: a few lines, shown instead of the body, set larger. Kyle approves the wording. */
  tldr?: ReactNode[]
  /** Present mode marks each line with an amber dot (Kyle). False when the lines bring their own markers. */
  tldrBullets?: boolean
}

// a closing punchline (an <em> line) stands on its own, without a dot
const isPunchline = (line: ReactNode) => isValidElement(line) && line.type === 'em'

/**
 * Story tier content: every narrative beat uses this, so headlines, body size, measure, and spacing match
 * from beat to beat. The beat's punchline doesn't live here: give it the Moments treatment as a
 * cardOverlay with SpotlightLine.
 */
export function Statement({ headline, body, wide = false, align = 'left', tldr, tldrBullets = true }: StatementProps) {
  const center = align === 'center'
  const short = usePresentMode() && tldr
  return (
    <div className={`flex flex-col ${center ? 'items-center text-center' : ''}`}>
      <Reveal as="h2" className="m-0 text-story font-extrabold">
        {headline}
      </Reveal>
      {short ? (
        <Reveal order={1} className="mt-[clamp(18px,calc(var(--u)*2.6),46px)] flex max-w-[34ch] flex-col gap-[0.6em] text-kicker text-fg text-pretty [&_p]:m-0">
          {tldrBullets ? (
            <>
              <BulletList>
                {tldr.filter((l) => !isPunchline(l)).map((line, i) => (
                  <BulletItem key={i}>{line}</BulletItem>
                ))}
              </BulletList>
              {tldr.filter(isPunchline).map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </>
          ) : (
            tldr.map((line, i) => <p key={i}>{line}</p>)
          )}
        </Reveal>
      ) : (
        <Reveal
          order={1}
          className={`mt-[clamp(18px,calc(var(--u)*2.6),46px)] flex flex-col gap-[0.65em] text-statement text-fg-muted text-pretty sm:gap-[0.8em] [&_p]:m-0 ${wide ? 'max-w-[64ch]' : 'max-w-[46ch]'}`}
        >
          {typeof body === 'string' ? <p>{body}</p> : body}
        </Reveal>
      )}
    </div>
  )
}
