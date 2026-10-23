import { AnimatePresence, motion } from 'motion/react'

/** First-run hint, shown until the first click, key press, or swipe. Pointer devices only. */
export function StartHint({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.p
          key="hint"
          role="note"
          className="pointer-events-none fixed inset-x-0 bottom-[max(10px,calc(6.5vh-30px))] z-[75] m-0 hidden h-[44px] items-center justify-center text-ui text-fg-soft [@media(hover:hover)_and_(pointer:fine)]:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.6, delay: 1.4 } }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
        >
          Click to begin, then use arrow keys
        </motion.p>
      )}
    </AnimatePresence>
  )
}
