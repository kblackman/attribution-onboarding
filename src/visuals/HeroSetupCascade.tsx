import { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'
import { usePrefersReducedMotion } from '../engine/reducedMotion'
import { FlowScreen, type FlowUI } from './onboarding-screens'

/*
  Hero imagery, "cascade" treatment (Kyle, 2026-11-05), after the From Data to Decision hero on kyleblackman.com:
  several screens overlapping on a diagonal, top-left to bottom-right, nearly flat (a slight lean, not a tilt
  back), running off the screen edges, the whole group at 21% so the title leads. Here the screens are the new
  setup flow in order (Create an event, Define conversion events, Connect ad sources, the waiting room), built
  from the walkthrough's own screens, so the hero quietly shows the answer: one guided flow, step by step.
  They slide in one after another on load. Phones show the first three, larger.
  The previous treatment (one screen tilted back) is HeroBackdrop + HeroSetupFlow, kept for comparison.
  Tune here.
*/
const CASCADE = {
  opacity: 0.21, // the group, as on the site's case study heroes
  lean: 'perspective(2400px) rotateX(9deg) rotateZ(-3deg)', // a slight lean, like From Data to Decision
  width: 0.5, // each screen, as a share of the stage width (phones: phoneWidth)
  phoneWidth: 1.15,
  stepX: 0.135, // offset between screens, as a share of the stage width
  stepY: 0.17, // and of the stage height
  startX: 0.04,
  startY: -0.02,
  enterDelay: 0.45,
  enterStagger: 0.16,
  enterDuration: 1.5,
}

const base: FlowUI = {
  screen: 'setup', phase: 1, drawer: false, name: '', selector: '', focus: null, events: 1, funnel: 'none', error: false,
  later: false, rule: false, ai: false, note: false, aiCollapsed: false, scroll: false, cursor: false,
}
const SCREENS: FlowUI[] = [
  base, // Create an event, with the first one made
  { ...base, phase: 2, funnel: 'low' }, // Define conversion events, marked low funnel
  { ...base, phase: 3, funnel: 'low' }, // Connect ad sources
  { ...base, screen: 'waiting', phase: 4, funnel: 'low' }, // the waiting room
]

const W = 1440
const H = 900

export function HeroSetupCascade() {
  const reduce = usePrefersReducedMotion()
  const stage = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = stage.current
    if (!el) return
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const phone = size.w > 0 && size.w <= 720
  const screens = phone ? SCREENS.slice(0, 3) : SCREENS
  const cardW = size.w * (phone ? CASCADE.phoneWidth : CASCADE.width)
  const scale = cardW / W
  // phones: tighter steps, so three larger screens still cascade across the narrow stage
  const stepX = phone ? 0.2 : CASCADE.stepX
  const stepY = phone ? 0.2 : CASCADE.stepY
  const startX = phone ? -0.35 : CASCADE.startX
  const startY = phone ? 0.1 : CASCADE.startY

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div ref={stage} className="absolute inset-0" style={{ opacity: CASCADE.opacity }}>
        <div className="absolute inset-0" style={{ transform: CASCADE.lean, transformOrigin: '50% 40%' }}>
          {size.w > 0 &&
            screens.map((ui, i) => (
              <motion.div
                key={i}
                className="absolute overflow-hidden rounded-[12px] shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
                style={{ left: size.w * (startX + stepX * i), top: size.h * (startY + stepY * i), width: cardW, height: cardW * (H / W) }}
                initial={{ opacity: 0, y: reduce ? 0 : 50, x: reduce ? 0 : -30 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={
                  reduce
                    ? { duration: 0.6, delay: CASCADE.enterDelay }
                    : { duration: CASCADE.enterDuration, delay: CASCADE.enterDelay + i * CASCADE.enterStagger, ease: EASE_DECK }
                }
              >
                <div className="absolute left-0 top-0 origin-top-left" style={{ width: W, height: H, transform: `scale(${scale})` }}>
                  <FlowScreen ui={ui} hover={null} reduced />
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  )
}
