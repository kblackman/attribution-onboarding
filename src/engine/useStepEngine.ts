import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Beat, Step } from './types'

/** Presses a beat's card takes: its own steps, plus one for a card overlay. None for a beat without a card. */
export const cardStepCount = (b: Beat) => (b.card === undefined ? 0 : Math.max(1, b.cardSteps ?? 1) + (b.cardOverlay ? 1 : 0))

/** Beats flatten into one ordered list of steps: card (one or more presses), then visual, then overlay, as each beat defines. */
export function buildSteps(beats: Beat[]): Step[] {
  return beats.flatMap((b, i) => {
    const steps: Step[] = Array.from({ length: cardStepCount(b) }, (_, sub) => ({ beat: i, kind: 'card' as const, sub }))
    if (b.visual) for (let sub = 0; sub < Math.max(1, b.visual.steps ?? 1); sub++) steps.push({ beat: i, kind: 'visual', sub })
    if (b.visual && b.overlay) steps.push({ beat: i, kind: 'overlay', sub: 0 })
    return steps
  })
}

/** Delay between a visual finishing and an auto overlay starting, so the end state reads first. */
const AUTO_OVERLAY_DELAY = 600

export function useStepEngine(beats: Beat[]) {
  const steps = useMemo(() => buildSteps(beats), [beats])
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const indexRef = useRef(index)
  indexRef.current = index
  const autoTimer = useRef<number | undefined>(undefined)

  const go = useCallback(
    (n: number) => {
      const next = Math.max(0, Math.min(steps.length - 1, n))
      if (next === indexRef.current) return
      window.clearTimeout(autoTimer.current)
      setDirection(next > indexRef.current ? 1 : -1)
      setIndex(next)
    },
    [steps.length],
  )
  const next = useCallback(() => go(indexRef.current + 1), [go])
  const prev = useCallback(() => go(indexRef.current - 1), [go])

  /** Called by a beat's visual when its animation or video ends. */
  const visualComplete = useCallback(
    (beat: number) => {
      const cur = steps[indexRef.current]
      if (!cur || cur.beat !== beat || cur.kind !== 'visual') return
      if (beats[beat].overlay?.trigger !== 'auto') return
      window.clearTimeout(autoTimer.current)
      autoTimer.current = window.setTimeout(() => {
        if (indexRef.current === steps.indexOf(cur)) go(indexRef.current + 1)
      }, AUTO_OVERLAY_DELAY)
    },
    [beats, steps, go],
  )

  useEffect(() => () => window.clearTimeout(autoTimer.current), [])

  return {
    steps,
    index,
    step: steps[index],
    direction,
    isFirst: index === 0,
    isLast: index === steps.length - 1,
    go,
    next,
    prev,
    visualComplete,
  }
}
