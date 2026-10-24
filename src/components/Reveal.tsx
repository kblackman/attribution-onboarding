import { createContext, useContext, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { usePrefersReducedMotion } from '../engine/reducedMotion'
import { DUR, EASE_DECK } from '../engine/motion'

/**
 * Set by the Card: whether its content has revealed, how long to wait for the card to land first,
 * which of the card's own key presses it's on (sub), and whether first-press content arrives with the
 * container's own motion instead of rising separately (still: statements, whose zoom is the entrance).
 */
export const RevealContext = createContext<{ revealed: boolean; lead: number; sub: number; still?: boolean }>({ revealed: true, lead: 0, sub: 0 })

interface RevealProps {
  /** Stagger position, as the deck's data-delay (each step is 280ms). */
  order?: number
  /** Which key press within the card shows this (0 = with the card). Needs the beat's cardSteps to cover it. */
  step?: number
  className?: string
  children: ReactNode
  as?: 'div' | 'p' | 'h1' | 'h2' | 'ul'
}

/** Deck content reveal: rises 26px and fades in, once per card, staggered by order. */
export function Reveal({ order = 0, step = 0, className, children, as = 'div' }: RevealProps) {
  const { revealed, lead, sub, still } = useContext(RevealContext)
  const reduce = usePrefersReducedMotion()
  const Tag = motion[as]
  const shown = (revealed || (still && step === 0)) && sub >= step
  // content that lands on a later key press waits for the press, not for the card
  const delay = shown ? (step === 0 ? lead : 0) + order * DUR.revealStep : 0
  const el = (
    <Tag
      className={className}
      initial={false}
      aria-hidden={step > 0 ? true : undefined}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: reduce ? 0 : 26 }}
      transition={still && step === 0 ? { duration: 0 } : reduce ? { duration: DUR.reduced } : { duration: shown ? DUR.reveal : DUR.reduced, ease: EASE_DECK, delay }}
    >
      {children}
    </Tag>
  )
  if (step === 0) return el
  // later-press content keeps its space while hidden; a screen reader hears it when it lands
  return (
    <>
      {el}
      <span className="sr-only" aria-live="polite">{shown ? children : null}</span>
    </>
  )
}
