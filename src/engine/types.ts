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
  /** Adds a soft accent glow to the card, as on the deck's title and divider cards. */
  cardGlow?: boolean
  visual?: BeatVisual
  overlay?: BeatOverlay
}

export type StepKind = 'card' | 'visual' | 'overlay'
export interface Step {
  beat: number
  kind: StepKind
}
