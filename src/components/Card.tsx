import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { cardVariants, cardVariantsReduced } from '../engine/motion'
import { RevealContext } from './Reveal'

export type CardStatus = 'below' | 'active' | 'behind' | 'gone'

interface CardProps {
  status: CardStatus
  /** Content has been revealed (plays once, the first time the card is active). */
  revealed: boolean
  /** Seconds to wait before content reveals: 0 on first load, the deck's 450ms after a card rises. */
  revealLead: number
  glow?: boolean
  reducedMotion: boolean
  label: string
  zIndex: number
  children: ReactNode
}

/** The deck card. Rises from below, recedes up and back when the story moves on. */
export function Card({ status, revealed, revealLead, glow, reducedMotion, label, zIndex, children }: CardProps) {
  const active = status === 'active'
  return (
    <motion.section
      aria-label={label}
      aria-hidden={!active}
      inert={!active}
      className={`deck-card${glow ? ' has-glow' : ''}`}
      style={{ zIndex, pointerEvents: active ? 'auto' : 'none' }}
      variants={reducedMotion ? cardVariantsReduced : cardVariants}
      initial={false}
      animate={status}
    >
      <RevealContext.Provider value={{ revealed, lead: revealLead }}>{children}</RevealContext.Provider>
    </motion.section>
  )
}
