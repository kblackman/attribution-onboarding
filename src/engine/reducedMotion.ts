import { useReducedMotion } from 'motion/react'

// ?reduced-motion in the URL forces the reduced path, for previewing it without changing OS settings
const forced = typeof location !== 'undefined' && new URLSearchParams(location.search).has('reduced-motion')

/** The OS reduced-motion preference, or the URL override. Use this instead of Motion's hook. */
export function usePrefersReducedMotion(): boolean {
  const os = useReducedMotion()
  return forced || !!os
}
