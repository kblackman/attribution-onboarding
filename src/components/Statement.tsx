import { useContext, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { Reveal, RevealContext } from './Reveal'
import { DUR, EASE_DECK } from '../engine/motion'
import { usePrefersReducedMotion } from '../engine/reducedMotion'

interface StatementProps {
  headline: string
  body: ReactNode
  /** Optional line that lands on the next key press. The beat needs cardSteps: 2. */
  kicker?: ReactNode
  /**
   * inline: an accent line under the body.
   * spotlight: the headline and body step back, and the kicker takes the center of the screen in italic,
   * between two short accent rules (an editorial pull statement). Pass each line as its own element
   * to set the break, and wrap the line to emphasize in <em>.
   */
  kickerStyle?: 'inline' | 'spotlight'
}

/**
 * Content for the statement variant (Beat variant: 'statement'): a large headline, body set larger than
 * a card's, and an optional kicker on the next press. For problem statements and other emphasis beats.
 */
export function Statement({ headline, body, kicker, kickerStyle = 'inline' }: StatementProps) {
  const { sub } = useContext(RevealContext)
  const reduce = usePrefersReducedMotion()
  const spotlight = kicker && kickerStyle === 'spotlight'
  const stepBack = spotlight && sub >= 1

  return (
    <>
      <motion.div
        className="flex flex-col"
        initial={false}
        animate={
          stepBack
            // without the blur (reduced motion), the body fades further so it can't collide with the kicker
            ? { opacity: reduce ? 0.04 : 0.12, scale: reduce ? 1 : 0.97, filter: reduce ? 'blur(0px)' : 'blur(6px)' }
            : { opacity: 1, scale: 1, filter: 'blur(0px)' }
        }
        style={{ originX: 0, originY: 0.5 }}
        transition={reduce ? { duration: DUR.reduced } : { duration: DUR.card, ease: EASE_DECK }}
      >
        <Reveal as="h2" className="m-0 text-display font-extrabold">
          {headline}
        </Reveal>
        <Reveal as="p" order={1} className="m-0 mt-[clamp(20px,calc(var(--u)*3),52px)] max-w-[46ch] text-statement text-fg-muted text-pretty">
          {body}
        </Reveal>
        {kicker && !spotlight && (
          <Reveal as="p" step={1} className="m-0 mt-[clamp(24px,calc(var(--u)*3.4),60px)] flex max-w-[34ch] gap-[clamp(14px,calc(var(--u)*1.6),26px)] text-kicker font-semibold text-accent text-pretty">
            <span className="mt-[0.62em] block h-0.5 w-[clamp(22px,calc(var(--u)*2.6),44px)] flex-none bg-accent" aria-hidden="true" />
            <span>{kicker}</span>
          </Reveal>
        )}
      </motion.div>

      {spotlight && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-[clamp(24px,calc(var(--u)*5),118px)]">
          <Reveal step={1} className="flex flex-col items-center text-center">
            <span className="block h-px w-[clamp(36px,calc(var(--u)*4),72px)] bg-accent" aria-hidden="true" />
            <p className="spotlight m-0 my-[clamp(22px,calc(var(--u)*3),48px)] max-w-[30ch] text-spotlight font-light italic text-fg text-balance">
              {kicker}
            </p>
            <span className="block h-px w-[clamp(36px,calc(var(--u)*4),72px)] bg-accent" aria-hidden="true" />
          </Reveal>
        </div>
      )}
    </>
  )
}
