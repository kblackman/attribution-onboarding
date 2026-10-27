import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { usePrefersReducedMotion } from '../engine/reducedMotion'
import { EASE_DECK } from '../engine/motion'

/*
  Entering or leaving present mode (T) crossfades the copy instead of swapping it (Kyle): the old version
  fades out with a slight blur, then the new one fades in and settles up a few pixels. Mounting is instant,
  so a beat arriving normally isn't affected. Reduced motion: opacity only.
*/
export const PRESENT_SWAP = { out: 0.22, in: 0.45 }

export function PresentSwap({ present, className, children }: { present: boolean; className?: string; children: ReactNode }) {
  const reduce = usePrefersReducedMotion()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={present ? 'short' : 'full'}
        // a layout member, so a headline in the same LayoutGroup glides when this changes size
        layout="position"
        className={className}
        initial={{ opacity: 0, y: reduce ? 0 : 8, filter: reduce ? 'blur(0px)' : 'blur(3px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: PRESENT_SWAP.in, ease: EASE_DECK } }}
        exit={{ opacity: 0, filter: reduce ? 'blur(0px)' : 'blur(3px)', transition: { duration: PRESENT_SWAP.out, ease: 'easeIn' } }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
