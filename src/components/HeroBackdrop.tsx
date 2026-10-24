import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'
import { usePrefersReducedMotion } from '../engine/reducedMotion'
import { PlaceholderBadge } from './Placeholder'

/*
  Pushed-back imagery behind the hero text, after the case study heroes: the image sits at 21% opacity,
  centered behind the text and tilted straight back (top away, bottom nearest the viewer), with its bottom
  fading into the page. Supporting weight, not the subject.
*/
const BACKDROP = {
  opacity: 0.21, // case study value
  tilt: 'perspective(1400px) rotateX(28deg)',
  fade: 'linear-gradient(to bottom, #000 30%, transparent 92%)', // bottom fades into the page
  enterDelay: 0.5,
  enterDuration: 1.8,
}

interface HeroBackdropProps {
  /** Shown as a small badge while the imagery is a placeholder. Omit once it's real. */
  placeholderLabel?: string
  children: ReactNode
}

export function HeroBackdrop({ placeholderLabel, children }: HeroBackdropProps) {
  const reduce = usePrefersReducedMotion()
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-[min(1180px,86vw)] flex-none max-[720px]:w-[160vw]"
          initial={{ opacity: 0, y: reduce ? 0 : 60 }}
          animate={{ opacity: BACKDROP.opacity, y: 0 }}
          transition={reduce ? { duration: 0.6, delay: BACKDROP.enterDelay } : { duration: BACKDROP.enterDuration, delay: BACKDROP.enterDelay, ease: EASE_DECK }}
        >
          <div style={{ transform: BACKDROP.tilt, transformOrigin: '50% 100%', maskImage: BACKDROP.fade, WebkitMaskImage: BACKDROP.fade }}>
            {children}
          </div>
        </motion.div>
      </div>
      {placeholderLabel && (
        <div className="absolute bottom-[clamp(16px,3vh,28px)] left-[calc(var(--gutter)+4px)] right-[calc(var(--gutter)+4px)] text-left">
          <PlaceholderBadge>{placeholderLabel}</PlaceholderBadge>
        </div>
      )}
    </div>
  )
}
