import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'
import { usePrefersReducedMotion } from '../engine/reducedMotion'
import { PlaceholderBadge } from './Placeholder'

/*
  Pushed-back imagery behind the hero text, after the case study heroes: the image sits at 21% opacity,
  tilted back in 3D, below the title and fading out at its top and bottom edges. Supporting weight, not the subject.
*/
const BACKDROP = {
  opacity: 0.21, // case study value
  tilt: 'perspective(1400px) rotateX(26deg) rotateY(-18deg) rotateZ(4deg)',
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
      <div
        className="absolute inset-0"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 36%, #000 58%, #000 76%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 36%, #000 58%, #000 76%, transparent 100%)',
        }}
      >
        <motion.div
          className="absolute left-1/2 top-[40%] w-[min(1180px,86vw)] max-[720px]:top-[46%] max-[720px]:w-[180vw]"
          style={{ x: '-50%' }}
          initial={{ opacity: 0, y: reduce ? 0 : 60 }}
          animate={{ opacity: BACKDROP.opacity, y: 0 }}
          transition={reduce ? { duration: 0.6, delay: BACKDROP.enterDelay } : { duration: BACKDROP.enterDuration, delay: BACKDROP.enterDelay, ease: EASE_DECK }}
        >
          <div style={{ transform: BACKDROP.tilt, transformOrigin: '50% 0%' }}>{children}</div>
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
