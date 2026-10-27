import type { ReactNode } from 'react'
import { LayoutGroup, motion } from 'motion/react'
import { usePresentMode } from '../engine/presentMode'
import { EASE_DECK } from '../engine/motion'
import { PRESENT_SWAP } from './PresentSwap'

/*
  A `text-with-aside` grid that knows about present mode. In present mode the `is-mid` layout (artifact beside the
  second paragraph, the others full width) would leave short points hanging over the artifact, so every point
  moves into the text column and the artifact sits beside them, top-aligned (`.is-present` in global.css).
  Wrap the artifact in `AsideGlide` so it glides to its new spot instead of jumping.
*/
export function TextWithAside({ className, children }: { className: string; children: ReactNode }) {
  const present = usePresentMode()
  // one LayoutGroup with the paragraphs' PresentSwaps, so the artifact also glides when the copy swaps mid-fade
  return (
    <LayoutGroup>
      <div className={`text-with-aside ${present ? 'is-present' : ''} ${className}`}>{children}</div>
    </LayoutGroup>
  )
}

export function AsideGlide({ children }: { children: ReactNode }) {
  // re-renders on T, so Motion measures the move
  usePresentMode()
  return (
    <motion.div layout="position" transition={{ duration: PRESENT_SWAP.in, ease: EASE_DECK }}>
      {children}
    </motion.div>
  )
}
