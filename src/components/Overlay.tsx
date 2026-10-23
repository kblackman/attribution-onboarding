import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { overlayTextVariants, overlayTextVariantsReduced, overlayVariants } from '../engine/motion'

interface OverlayProps {
  shown: boolean
  reducedMotion: boolean
  zIndex: number
  children: ReactNode
}

/**
 * Semi-transparent scrim over a blurred visual, with text on top.
 * The blur is applied to the visual itself (VisualFrame "dimmed"); the scrim keeps text at AA.
 */
export function Overlay({ shown, reducedMotion, zIndex, children }: OverlayProps) {
  return (
    <motion.div
      className="fixed inset-0 flex items-center px-[var(--gutter)]"
      style={{ zIndex, background: 'var(--scrim)', pointerEvents: shown ? 'auto' : 'none' }}
      aria-hidden={!shown}
      inert={!shown}
      variants={overlayVariants}
      initial={false}
      animate={shown ? 'shown' : 'hidden'}
    >
      <motion.div
        className="mx-auto w-full max-w-[1080px]"
        variants={reducedMotion ? overlayTextVariantsReduced : overlayTextVariants}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
