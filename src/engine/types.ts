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
}

export interface BeatVisual {
  component: ComponentType<VisualProps>
  /** Text description of what the visual shows, for screen readers. Required. */
  description: string
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
  variant?: 'card' | 'statement' | 'hero'
  /** hero only: center the title screen, as on the case study pages (default left, as in the decks). */
  align?: 'left' | 'center'
  /** Adds a soft accent glow to the card, as on the deck's title and divider cards. */
  cardGlow?: boolean
  /** Card only: the decks' tighter top and bottom padding (their sub-slides), for text-heavy cards set large. */
  cardDense?: boolean
  /**
   * Key presses the card takes before moving on (default 1). Content wrapped in <Reveal step={n}>
   * appears on press n, e.g. a kicker line that lands after the body.
   */
  cardSteps?: number
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
