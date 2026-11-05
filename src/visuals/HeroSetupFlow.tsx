import { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'
import { usePrefersReducedMotion } from '../engine/reducedMotion'
import { FlowScreen, type FlowUI } from './onboarding-screens'

/*
  The hero's pushed-back imagery: the new setup flow, frozen on Define conversion events with the event marked
  low funnel. Built from the walkthrough's own screen (onboarding-screens.tsx), so it matches 04 Solution.
  Static: the 1440 x 900 screen scaled to the width it's given.
*/
const UI: FlowUI = {
  screen: 'setup', phase: 2, drawer: false, name: '', selector: '', focus: null, events: 1, funnel: 'low', error: false,
  later: false, rule: false, ai: false, note: false, aiCollapsed: false, scroll: false, cursor: false,
}

const W = 1440
const H = 900

/*
  Screens stacked behind the front one (Kyle, 2026-11-05): further up the tilted plane, so further into the
  distance, each a little smaller and darker, so the stack falls away into the dark. The rest of the setup flow,
  in order, recedes behind step 2. They fade in one after another once the front screen has settled.
  Tune here: step is how far up each one sits (share of a screen's height), shrink and dark are per screen.
*/
export const STACK = { step: 0.34, shrink: 0.05, dark: 0.24, enter: 1.3, stagger: 0.28, duration: 1.2 }
const BEHIND: FlowUI[] = [
  { ...UI, phase: 3 }, // Connect ad sources
  { ...UI, phase: 4 }, // Enable AI
  { ...UI, screen: 'waiting', phase: 4 }, // the waiting room
]
/** Extra height above the front screen that the stack needs, as a share of the frame's width. */
export const STACK_HEADROOM = BEHIND.length * STACK.step * (H / W)
// for HeroBackdrop: keep the front screen where it sat alone (centered, same bottom fade)
const front = H / W
const total = STACK_HEADROOM + front
const at = (share: number) => `${(((STACK_HEADROOM + share * front) / total) * 100).toFixed(1)}%`
export const STACK_FADE = `linear-gradient(to bottom, #000 ${at(0.3)}, transparent ${at(0.92)})`
/** Shifts the whole stack up by half the headroom (as a share of its own height), so the front screen stays centered. */
export const STACK_SHIFT = `${((-(STACK_HEADROOM / 2) / total) * 100).toFixed(1)}%`

export function HeroSetupFlow() {
  const reduce = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(el.clientWidth / W))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const screen = (ui: FlowUI) => (
    <div className="absolute left-0 top-0 origin-top-left" style={{ width: W, height: H, transform: `scale(${scale})` }}>
      <FlowScreen ui={ui} hover={null} reduced />
    </div>
  )
  const h = scale * H // the front screen's height in px

  return (
    // headroom above the front screen for the stack behind it
    <div className="relative w-full" style={{ paddingTop: `${STACK_HEADROOM * 100}%` }}>
      {scale > 0 &&
        BEHIND.map((ui, i) => {
          const n = i + 1
          return (
            <motion.div
              key={i}
              className="absolute left-0 w-full overflow-hidden rounded-[12px]"
              style={{ aspectRatio: `${W} / ${H}`, bottom: n * STACK.step * h, scale: 1 - n * STACK.shrink, originY: 1, zIndex: -n }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reduce ? { duration: 0.6 } : { duration: STACK.duration, delay: STACK.enter + i * STACK.stagger, ease: EASE_DECK }}
            >
              {screen(ui)}
              {/* falls away into the dark */}
              <div className="absolute inset-0 bg-black" style={{ opacity: Math.min(0.9, n * STACK.dark) }} />
            </motion.div>
          )
        })}
      <div ref={ref} className="relative w-full overflow-hidden rounded-[12px]" style={{ aspectRatio: `${W} / ${H}` }}>
        {screen(UI)}
      </div>
    </div>
  )
}
