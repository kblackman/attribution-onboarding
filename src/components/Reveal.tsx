import { createContext, useContext, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { usePrefersReducedMotion } from '../engine/reducedMotion'
import { DUR, EASE_DECK } from '../engine/motion'

/** Set by the Card: whether its content has revealed, and how long to wait for the card to land first. */
export const RevealContext = createContext<{ revealed: boolean; lead: number }>({ revealed: true, lead: 0 })

interface RevealProps {
  /** Stagger position, as the deck's data-delay (each step is 280ms). */
  order?: number
  className?: string
  children: ReactNode
  as?: 'div' | 'p' | 'h1' | 'h2' | 'ul'
}

/** Deck content reveal: rises 26px and fades in, once per card, staggered by order. */
export function Reveal({ order = 0, className, children, as = 'div' }: RevealProps) {
  const { revealed, lead } = useContext(RevealContext)
  const reduce = usePrefersReducedMotion()
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={false}
      animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: reduce ? 0 : 26 }}
      transition={
        reduce
          ? { duration: DUR.reduced }
          : { duration: DUR.reveal, ease: EASE_DECK, delay: revealed ? lead + order * DUR.revealStep : 0 }
      }
    >
      {children}
    </Tag>
  )
}
