import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { overlayActionVariants, overlayTextVariants, overlayTextVariantsReduced, overlayVariants } from '../engine/motion'

interface OverlayProps {
  shown: boolean
  reducedMotion: boolean
  zIndex: number
  children: ReactNode
  /** Links or buttons under the text (the portfolio's end-of-story actions). Kept out of the hidden text copy. */
  actions?: ReactNode
}

/**
 * Semi-transparent scrim over a blurred visual, with text on top.
 * The blur is applied to the visual itself (VisualFrame "dimmed"); the scrim keeps text at AA.
 */
export function Overlay({ shown, reducedMotion, zIndex, children, actions }: OverlayProps) {
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
      <div className="mx-auto w-full max-w-[1080px]">
        <motion.div aria-hidden="true" variants={reducedMotion ? overlayTextVariantsReduced : overlayTextVariants}>
          {children}
        </motion.div>
        {actions && (
          <motion.div variants={reducedMotion ? overlayTextVariantsReduced : overlayActionVariants}>
            {actions}
          </motion.div>
        )}
      </div>
      {/* the overlay's text is hidden while it waits; a screen reader hears it when it lands */}
      <div className="sr-only" aria-live="polite">{shown ? children : null}</div>
    </motion.div>
  )
}
