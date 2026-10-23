import { useEffect, useRef, useState } from 'react'
import type { VisualProps } from './types'

export type PlaybackMode = 'empty' | 'play' | 'done'

/**
 * Shared playback for coded visuals.
 * empty: initial state. play: running the timeline. done: final state with no animation (stepped back in).
 * Calls onComplete once, `seconds` after play starts. Resets to empty after the frame has faded out,
 * so the next visit replays.
 */
export function useVisualPlayback({ active, startFinished, onComplete }: VisualProps, seconds: number): PlaybackMode {
  const [mode, setMode] = useState<PlaybackMode>(startFinished ? 'done' : 'empty')
  const completed = useRef(false)

  useEffect(() => {
    if (!active) {
      const t = window.setTimeout(() => { setMode('empty'); completed.current = false }, 800)
      return () => window.clearTimeout(t)
    }
    if (startFinished) {
      setMode('done')
      completed.current = true
      return
    }
    if (completed.current) return
    setMode('play')
    const t = window.setTimeout(() => { completed.current = true; onComplete() }, seconds * 1000)
    return () => window.clearTimeout(t)
  }, [active, startFinished, seconds, onComplete])

  return mode
}
