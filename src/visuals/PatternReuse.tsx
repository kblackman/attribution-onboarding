import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'
import type { VisualProps } from '../engine/types'
import { useVisualPlayback } from '../engine/useVisualPlayback'
import { HandCircle } from '../components/HandCircle'
import { ProcessingCard, Progress, TopBar } from './onboarding-screens'

/*
  05 Impact, "Bigger than Attribution": the stepped progress indicator and the waiting room in Attribution,
  then the same pieces in Web Analytics beside it. Both windows use the walkthrough's own components
  (TopBar, Progress, ProcessingCard from onboarding-screens.tsx), so they're identical by construction.
  Web Analytics' own wording is placeholder bars: Kyle doesn't have those screens. Each window shows the waiting
  room's header (feature name) and card under the setup guide's progress, so both pieces sit in one view.
  Once both are filled, Kyle's magenta markup points out the one thing that changed, the feature name, circled
  in each heading, with a handwritten note and arrows above the windows (Kyle, 2026-11-04: show why this
  matters, the framework is reusable). On phones the note sits between the stacked windows, without arrows.
  Tune the timing here (seconds).
*/
export const TIMING = {
  first: 0.4, // Attribution's window lands, centered
  fill: 1.1, // its progress fills, step by step
  slide: 2.6, // it moves left as Web Analytics lands beside it
  move: 1.0,
  mark: 1.2, // after Web Analytics fills: the feature names get circled, Attribution first
  markGap: 0.35,
  note: 0.9, // after the first circle starts: the note and its arrows
  hold: 2.4, // after the note, before the overlay
}
const SECOND_FILL = TIMING.slide + 0.6
const MARK_AT = SECOND_FILL + TIMING.mark
const NOTE_AT = MARK_AT + TIMING.note
export const TOTAL = NOTE_AT + TIMING.hold

/** The handwritten note (Kyle's wording, 2026-11-04). */
const NOTE = 'The same framework, reusable across the platform'

const W = 1640 // the stage: two 780px windows and a gap
const H = 640
const WIN = 780
const GAP = 80
const TOP = 150 // room above the windows for the note (side by side)
const GAP_S = 150 // room between the windows for the note (stacked)

const bar = (w: number) => <span className="inline-block h-[10px] rounded-full bg-skeleton-strong align-middle" style={{ width: w }} />

export function PatternReuse(props: VisualProps) {
  const { reducedMotion: reduced } = props
  const mode = useVisualPlayback(props, TOTAL)
  const playing = mode === 'play'
  const on = mode !== 'empty'
  const tr = (delay: number, duration: number) => (playing ? { duration: reduced ? 0.3 : duration, delay, ease: EASE_DECK } : { duration: 0 })

  // scale the stage to the frame
  const frameRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  // on narrow screens (phones) the windows stack, Web Analytics below Attribution, so each stays readable
  const [stacked, setStacked] = useState(false)
  const stageW = stacked ? WIN : W
  const stageH = stacked ? H * 2 + GAP_S : H + TOP
  const top = stacked ? 0 : TOP
  useLayoutEffect(() => {
    const el = frameRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const narrow = (el.parentElement?.clientWidth ?? el.clientWidth) < 720
      setStacked(narrow)
      setScale(el.clientWidth / (narrow ? WIN : W))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // progress fills through the four steps to done (phase 5), one step at a time
  const [phaseA, setPhaseA] = useState(0)
  const [phaseB, setPhaseB] = useState(0)
  useLayoutEffect(() => {
    if (mode !== 'play' || reduced) {
      const v = mode === 'empty' ? 0 : 5
      setPhaseA(v)
      setPhaseB(v)
      return
    }
    const ts: number[] = []
    for (let p = 1; p <= 5; p++) {
      ts.push(window.setTimeout(() => setPhaseA(p), (TIMING.fill + (p - 1) * 0.22) * 1000))
      ts.push(window.setTimeout(() => setPhaseB(p), (SECOND_FILL + (p - 1) * 0.22) * 1000))
    }
    return () => ts.forEach((t) => window.clearTimeout(t))
  }, [mode, reduced])

  // where each circled name sits on the stage (unscaled), for the arrows
  const nameA = useRef<HTMLSpanElement>(null)
  const nameB = useRef<HTMLSpanElement>(null)
  const [ends, setEnds] = useState<{ a: [number, number]; b: [number, number] } | null>(null)
  useLayoutEffect(() => {
    if (!nameA.current || !nameB.current || !scale) return
    // each name's spot inside its own window (they move together), plus where that window comes to rest
    const inWin = (el: HTMLElement): [number, number] => {
      const r = el.getBoundingClientRect()
      const w = (el.closest('[data-win]') as HTMLElement).getBoundingClientRect()
      return [(r.left + r.width / 2 - w.left) / scale, (r.top - w.top) / scale]
    }
    const a = inWin(nameA.current)
    const b = inWin(nameB.current)
    const restA = (W - WIN * 2 - GAP) / 2
    setEnds({ a: [restA + a[0], TOP + a[1]], b: [restA + WIN + GAP + b[0], TOP + b[1]] })
  }, [scale, stacked])
  const marked = on
  const instant = !playing

  const centered = (W - WIN) / 2
  const left = (W - WIN * 2 - GAP) / 2

  return (
    <div className="absolute inset-0 flex items-center justify-center px-[var(--gutter)] pb-[clamp(72px,11vh,120px)] pt-[clamp(56px,8vh,96px)]">
      <div
        ref={frameRef}
        className="relative w-full max-w-[1500px]"
        style={{ aspectRatio: `${stageW} / ${stageH}`, maxWidth: stacked ? `calc((100dvh - 220px) * ${stageW / stageH})` : undefined }}
        aria-hidden="true"
      >
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: stageW, height: stageH, transform: `scale(${scale})` }}>
          {/* Attribution: lands centered, then moves left to make room */}
          <motion.div
            className="absolute"
            style={{ width: WIN, top }}
            initial={false}
            animate={{ left: 0, x: stacked ? 0 : on ? left : centered, opacity: on ? 1 : 0, y: on || reduced ? 0 : 40 }}
            transition={playing ? { x: { duration: reduced ? 0 : TIMING.move, delay: TIMING.slide, ease: EASE_DECK }, opacity: { duration: 0.6, delay: TIMING.first }, y: { duration: 0.9, delay: TIMING.first, ease: EASE_DECK } } : { duration: 0 }}
          >
            <Window crumb="Attribution" feature="Attribution" nameRef={nameA} phase={phaseA} reduced={reduced} mark={{ show: marked, instant, delay: MARK_AT, variant: 0 }} />
          </motion.div>
          {/* Web Analytics: the same pieces, beside it */}
          <motion.div
            className="absolute"
            style={stacked ? { width: WIN, left: 0, top: H + GAP_S } : { width: WIN, left: left + WIN + GAP, top }}
            initial={false}
            animate={{ opacity: on ? 1 : 0, y: on || reduced ? 0 : 40 }}
            transition={tr(TIMING.slide + 0.2, 0.9)}
          >
            <Window
              crumb="Web Analytics"
              feature="Web Analytics"
              nameRef={nameB}
              mark={{ show: marked, instant, delay: MARK_AT + TIMING.markGap, variant: 1 }}
              phase={phaseB}
              reduced={reduced}
              labels={[bar(96), bar(120), bar(104), bar(80)]}
              cardTitle={bar(220)}
              cardBody={
                <span className="flex flex-col items-center gap-[10px] py-[5px]">
                  {bar(420)}
                  {bar(360)}
                </span>
              }
            />
          </motion.div>

          {/* the note: above the windows with an arrow to each circled name, or between them when stacked */}
          <motion.p
            className="absolute m-0 whitespace-nowrap text-center font-[family-name:var(--font-hand)] font-bold leading-none text-annotation"
            style={{ fontSize: stacked ? 34 : 46, left: stageW / 2, top: stacked ? H + GAP_S / 2 : 34, x: '-50%', y: stacked ? '-50%' : 0, rotate: -3 }}
            initial={false}
            animate={{ opacity: marked ? 1 : 0 }}
            transition={instant ? { duration: 0 } : { duration: reduced ? 0.3 : 0.45, delay: NOTE_AT }}
          >
            {NOTE}
          </motion.p>
          {!stacked && ends && (
            <motion.svg
              className="pointer-events-none absolute left-0 top-0 overflow-visible"
              width={stageW}
              height={stageH}
              initial={false}
              animate={{ opacity: marked ? 1 : 0 }}
              transition={instant ? { duration: 0 } : { duration: reduced ? 0.3 : 0.5, delay: NOTE_AT + 0.2 }}
            >
              <g fill="none" stroke="var(--color-annotation)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                {([
                  [stageW / 2 - 250, 92, ends.a, -1],
                  [stageW / 2 + 250, 92, ends.b, 1],
                ] as const).map(([sx, sy, [ex0, ey0], side], i) => {
                  const ex = ex0
                  const ey = ey0 - 18
                  const qx = (sx + ex) / 2 + side * 30
                  const qy = Math.min(sy, ey) - 10
                  const ang = Math.atan2(ey - qy, ex - qx)
                  const hd = 14
                  return (
                    <g key={i}>
                      <path d={`M${sx},${sy} Q${qx},${qy} ${ex},${ey}`} />
                      <path d={`M${ex - hd * Math.cos(ang - 0.5)},${ey - hd * Math.sin(ang - 0.5)} L${ex},${ey} L${ex - hd * Math.cos(ang + 0.5)},${ey - hd * Math.sin(ang + 0.5)}`} />
                    </g>
                  )
                })}
              </g>
            </motion.svg>
          )}
        </div>
      </div>
    </div>
  )
}

/** One product window: top bar, the setup guide's heading and progress, and the waiting room's card. */
function Window({
  crumb,
  feature,
  nameRef,
  mark,
  phase,
  reduced,
  labels,
  cardTitle,
  cardBody,
}: {
  crumb: string
  feature: string
  nameRef: RefObject<HTMLSpanElement | null>
  mark: { show: boolean; instant: boolean; delay: number; variant: number }
  phase: number
  reduced: boolean
  labels?: ReactNode[]
  cardTitle?: ReactNode
  cardBody?: ReactNode
}) {
  return (
    <div data-win className="overflow-hidden rounded-[16px] bg-fp-bg font-fp text-fp-ink shadow-[0_24px_60px_rgba(0,0,0,0.45)]" style={{ fontSize: 14, height: H }}>
      <TopBar crumb={crumb} />
      <div className="mx-auto w-[700px] pt-[36px]">
        <p className="m-0 text-[12px] font-bold tracking-[0.6px] text-fp-indigo-soft">SETUP GUIDE</p>
        <h3 className="m-0 mt-[4px] text-[28px] font-semibold leading-normal tracking-[-0.56px]">
          Getting started with{' '}
          <span ref={nameRef} className="relative inline-block">
            {feature}
            <span className="pointer-events-none absolute -bottom-[8px] -left-[16px] -right-[16px] -top-[6px]">
              <HandCircle show={mark.show} instant={mark.instant} reducedMotion={reduced} delay={mark.delay} duration={0.6} variant={mark.variant} className="inset-0 h-full w-full" />
            </span>
          </span>
        </h3>
        <Progress phase={phase} reduced={reduced} labels={labels} className="mt-[28px]" />
        <div className="mt-[36px] flex items-center gap-[14px]">
          <span className="text-[16px] font-semibold">{crumb}</span>
        </div>
        <ProcessingCard reduced={reduced} className="mt-[14px] py-[28px]" title={cardTitle} body={cardBody} />
      </div>
    </div>
  )
}
