import { motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'
import { usePrefersReducedMotion } from '../engine/reducedMotion'

interface HorizonLineProps {
  /**
   * Drawn (true) or not (false). Leave undefined inside an animated parent that uses
   * 'hidden' / 'shown' variants (the Overlay), and the line follows it.
   */
  show?: boolean
  /** Seconds before it draws. */
  delay?: number
  duration?: number
  /** CSS width, e.g. 'min(56vw, 720px)'. */
  width?: string
  className?: string
}

/**
 * The Moments signature: a thin accent line that draws out from its center like a horizon.
 * Used under the hero title, in every section title sequence, and under every punchline overlay.
 */
export function HorizonLine({ show, delay = 0, duration = 1.1, width = 'min(40vw, 520px)', className = '' }: HorizonLineProps) {
  const reduce = usePrefersReducedMotion()
  const hidden = { scaleX: reduce ? 1 : 0, opacity: 0 }
  const drawn = { scaleX: 1, opacity: 1 }
  const transition = reduce ? { duration: 0.4, delay } : { duration, delay, ease: EASE_DECK }
  const shared = { className: `block h-px origin-center bg-accent ${className}`, style: { width }, 'aria-hidden': true as const }
  if (show === undefined) {
    return <motion.span {...shared} variants={{ hidden: { ...hidden, transition: { duration: 0.3 } }, shown: { ...drawn, transition } }} />
  }
  return <motion.span {...shared} initial={false} animate={show ? drawn : hidden} transition={show ? transition : { duration: 0 }} />
}
