import type { ComponentType, ReactNode } from 'react'

/** Props every full-screen visual receives from the engine. */
export interface VisualProps {
  /** The visual is the current step (or sits under its overlay). Start or keep playing. */
  active: boolean
  /** Arrived by stepping back: render the finished state, don't replay or re-fire onComplete. */
  startFinished: boolean
  reducedMotion: boolean
  /** Call once when the animation or video ends. Drives an auto overlay. */
  onComplete: () => void
  /** Multi-step visuals (BeatVisual.steps): which step the reader is on. 0 for single-step visuals. */
  sub: number
  /** Multi-step visuals: move to the next step if the reader is still on `sub` (auto-advance). */
  requestNext: (sub: number) => void
}

export interface BeatVisual {
  component: ComponentType<VisualProps>
  /** Text description of what the visual shows, for screen readers. Required. */
  description: string
  /** Key presses the visual takes (default 1). Each press moves `sub` on by one; Back reverses it. */
  steps?: number
}

export interface BeatOverlay {
  /** auto: fade in when the visual completes. key: wait for the next key press. */
  trigger: 'auto' | 'key'
  content: ReactNode
}

export interface Beat {
  slug: string
  /** Short name used in the progress label and screen reader announcements. */
  title: string
  card: ReactNode
  /**
   * card: the deck card. statement: no container, larger type set directly on the background, for emphasis beats.
   * hero: the decks' title screen, full-bleed with a Begin row, receding into depth on exit. Use for the opening.
   */
  variant?: 'card' | 'statement' | 'hero' | 'section'
  /** Section cards only (made by sectionCard()): the section this card opens. */
  sectionId?: string
  /** hero only: center the title screen, as on the case study pages (default left, as in the decks). */
  align?: 'left' | 'center'
  /** Adds a soft accent glow to the card, as on the deck's title and divider cards. */
  cardGlow?: boolean
  /** Card or statement: the decks' tighter top and bottom padding (their sub-slides), for text-heavy beats set large. */
  cardDense?: boolean
  /**
   * Key presses the card takes before moving on (default 1). Content wrapped in <Reveal step={n}>
   * appears on press n, e.g. a kicker line that lands after the body.
   */
  cardSteps?: number
  /**
   * A full-screen overlay that lands on the press after the card's own steps: the card pushes back
   * (smaller, blurred, dimmed) and the overlay's scrim and text take the screen. Reverses on Back.
   */
  cardOverlay?: ReactNode
  visual?: BeatVisual
  overlay?: BeatOverlay
}

export type StepKind = 'card' | 'visual' | 'overlay'
export interface Step {
  beat: number
  kind: StepKind
  /** Position within the card's own steps (0 for visual and overlay). */
  sub: number
}
