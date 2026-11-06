import { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { usePrefersReducedMotion } from '../engine/reducedMotion'
import { FlowScreen, type FlowUI } from './onboarding-screens'

/*
  Hero imagery, fanned version (Kyle, 2026-11-05): instead of the stack running up a plane tilted straight back,
  the screens fan off into the distance to the left. The whole row is turned on its vertical axis, left side away,
  so each screen further left sits further away; each is also darker, so the row falls into the dark.
  The front screen (step 2, event marked low funnel) stays centered behind the hero text. The rest of the setup
  flow, in order, runs off to its left.
  Intro (Kyle, 2026-11-06): the screens start tucked behind the front one and slide out to their places together,
  slow and smooth, settling with a long ease-out; the furthest travels furthest, so it arrives last. They darken
  as they go.
  Tune here: turn is the row's angle, step is how far left each screen sits (share of a screen's width),
  depth pushes each one back a little more, dark is per screen. enter is when the slide starts (after the front
  screen has mostly arrived), duration how long it takes, stagger the small offset between screens.
*/
export const FAN = { turn: -38, lift: 4, step: 0.6, depth: 120, dark: 0.22, enter: 1.5, stagger: 0.15, duration: 3.2 }
// eases in gently, then a long, soft glide into place (no snap off the line)
const EASE_GLIDE = [0.5, 0, 0.1, 1] as const

const UI: FlowUI = {
  screen: 'setup', phase: 2, drawer: false, name: '', selector: '', focus: null, events: 1, funnel: 'low', error: false,
  later: false, rule: false, ai: false, note: false, aiCollapsed: false, scroll: false, cursor: false,
}
const BEHIND: FlowUI[] = [
  { ...UI, phase: 3 }, // Connect ad sources
  { ...UI, phase: 4 }, // Enable AI
  { ...UI, screen: 'waiting', phase: 4 }, // the waiting room
]

const W = 1440
const H = 900
// each screen's own bottom fade (a mask on the whole row would clip the screens that run past it)
const FADE = 'linear-gradient(to bottom, #000 30%, transparent 92%)'

export function HeroSetupFan() {
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
  const card = 'absolute inset-0 overflow-hidden rounded-[12px]'

  return (
    <div ref={ref} className="relative w-full" style={{ aspectRatio: `${W} / ${H}`, perspective: '1600px' }}>
      <div
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d', transform: `rotateY(${FAN.turn}deg) rotateX(${FAN.lift}deg)` }}
      >
        {scale > 0 &&
          BEHIND.map((ui, i) => {
            const n = i + 1
            return (
              <motion.div
                key={i}
                className={card}
                style={{ maskImage: FADE, WebkitMaskImage: FADE }}
                // tucked just behind the front screen, then out to its place
                initial={reduce ? { x: `${-n * FAN.step * 100}%`, z: -n * FAN.depth, opacity: 0 } : { x: '0%', z: -n * 6, opacity: 1 }}
                animate={{ x: `${-n * FAN.step * 100}%`, z: -n * FAN.depth, opacity: 1 }}
                transition={reduce ? { duration: 0.6, delay: FAN.enter } : { duration: FAN.duration, delay: FAN.enter + i * FAN.stagger, ease: EASE_GLIDE }}
              >
                {screen(ui)}
                {/* falls away into the dark as it slides out */}
                <motion.div
                  className="absolute inset-0 bg-black"
                  initial={{ opacity: reduce ? Math.min(0.9, n * FAN.dark) : 0 }}
                  animate={{ opacity: Math.min(0.9, n * FAN.dark) }}
                  transition={reduce ? { duration: 0 } : { duration: FAN.duration, delay: FAN.enter + i * FAN.stagger, ease: 'easeInOut' }}
                />
              </motion.div>
            )
          })}
        <div className={card} style={{ maskImage: FADE, WebkitMaskImage: FADE }}>
          {scale > 0 && screen(UI)}
        </div>
      </div>
    </div>
  )
}
