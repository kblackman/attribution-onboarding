import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { DUR, cardVariants, cardVariantsReduced, heroVariants, statementVariants } from '../engine/motion'
import { RevealContext } from './Reveal'

export type CardStatus = 'below' | 'active' | 'behind' | 'gone'

interface CardProps {
  status: CardStatus
  /** card: deck card frame. statement: no container, text directly on the background. hero: the decks' title screen. */
  variant?: 'card' | 'statement' | 'hero'
  /** Content has been revealed (plays once, the first time the card is active). */
  revealed: boolean
  /** Seconds to wait before content reveals: 0 on first load, the deck's 450ms after a card rises. */
  revealLead: number
  /** Which of the card's own key presses is current. */
  sub: number
  glow?: boolean
  dense?: boolean
  align?: 'left' | 'center'
  reducedMotion: boolean
  label: string
  zIndex: number
  children: ReactNode
}

/** The deck card. Rises from below, recedes up and back when the story moves on. */
export function Card({ status, variant = 'card', align = 'left', dense = false, revealed, revealLead, sub, glow, reducedMotion, label, zIndex, children }: CardProps) {
  const active = status === 'active'
  const statement = variant === 'statement'
  const className = variant === 'hero' ? `deck-hero${align === 'center' ? ' is-centered' : ''}` : statement ? 'deck-statement' : `deck-card${glow ? ' has-glow' : ''}${dense ? ' is-dense' : ''}`
  const variants = reducedMotion ? cardVariantsReduced : variant === 'hero' ? heroVariants : statement ? statementVariants : cardVariants
  return (
    <motion.section
      aria-label={label}
      aria-hidden={!active}
      inert={!active}
      className={className}
      // the hero recedes in z, so it carries the decks' 1400px perspective
      style={{ zIndex, pointerEvents: active ? 'auto' : 'none', transformPerspective: variant === 'hero' ? 1400 : undefined }}
      variants={variants}
      initial={false}
      animate={status}
    >
      <RevealContext.Provider value={{ revealed, lead: statement && revealLead > 0 ? DUR.statementLead : revealLead, sub }}>{children}</RevealContext.Provider>
    </motion.section>
  )
}
