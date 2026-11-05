import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { cardVariants, cardVariantsReduced, heroVariants, sectionVariants, statementVariants } from '../engine/motion'
import { RevealContext } from './Reveal'

export type CardStatus = 'below' | 'active' | 'pushed' | 'behind' | 'gone'

interface CardProps {
  status: CardStatus
  /** card: deck card frame. statement: no container, text directly on the background. hero: the decks' title screen. */
  variant?: 'card' | 'statement' | 'hero' | 'section'
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
  // a card that scrolls (phones) always arrives at its top
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    if (active && ref.current) ref.current.scrollTop = 0
  }, [active])
  // a card taller than the screen scrolls inside itself; it then takes keyboard focus so it can be scrolled
  // with the arrow keys too (WCAG 2.1.1). Only while it actually overflows, so it adds no tab stop otherwise.
  const [scrolls, setScrolls] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || !active) return
    const check = () => setScrolls(el.scrollHeight > el.clientHeight + 1 && getComputedStyle(el).overflowY !== 'visible')
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    return () => ro.disconnect()
  }, [active])
  // pushed: still the current step, sitting back behind a card overlay
  const statement = variant === 'statement'
  const className = variant === 'section' ? 'deck-section' : variant === 'hero' ? `deck-hero${align === 'center' ? ' is-centered' : ''}` : statement ? `deck-statement${dense ? ' is-dense' : ''}` : `deck-card${glow ? ' has-glow' : ''}${dense ? ' is-dense' : ''}`
  const variants = reducedMotion ? cardVariantsReduced : variant === 'section' ? sectionVariants : variant === 'hero' ? heroVariants : statement ? statementVariants : cardVariants
  return (
    <motion.section
      ref={ref}
      aria-label={label}
      aria-hidden={!active}
      inert={!active}
      tabIndex={active && scrolls ? 0 : undefined}
      className={className}
      // the hero recedes in z, so it carries the decks' 1400px perspective
      style={{ zIndex, pointerEvents: active ? 'auto' : 'none', transformPerspective: variant === 'hero' ? 1400 : undefined }}
      variants={variants}
      initial={false}
      animate={status}
    >
      <RevealContext.Provider value={{ revealed, lead: revealLead, sub, still: statement }}>{children}</RevealContext.Provider>
    </motion.section>
  )
}
