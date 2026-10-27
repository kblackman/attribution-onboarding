import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'
import type { VisualProps } from '../engine/types'
import { useVisualPlayback } from '../engine/useVisualPlayback'
import { PlaceholderBadge } from '../components/Placeholder'
import { ProcessingCard, Progress, TopBar } from './onboarding-screens'

/*
  05 Impact, "Bigger than Attribution": the stepped progress indicator and the waiting room in Attribution,
  then the same pieces in Web Analytics beside it. Both windows use the walkthrough's own components
  (TopBar, Progress, ProcessingCard from onboarding-screens.tsx), so they're identical by construction.
  Web Analytics' own wording is placeholder bars: Kyle doesn't have those screens. Each window shows the waiting
  room's header (feature name, PROCESSING) and card under the setup guide's progress, so both pieces sit in one view.
  Tune the timing here (seconds).
*/
export const TIMING = {
  first: 0.4, // Attribution's window lands, centered
  fill: 1.1, // its progress fills, step by step
  slide: 2.6, // it moves left as Web Analytics lands beside it
  move: 1.0,
  hold: 1.8, // after Web Analytics fills, before the overlay
}
const SECOND_FILL = TIMING.slide + 0.6
export const TOTAL = SECOND_FILL + 1.2 + TIMING.hold

const W = 1640 // the stage: two 780px windows and a gap
const H = 640
const WIN = 780
const GAP = 80

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
  const stageH = stacked ? H * 2 + GAP : H
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

  const centered = (W - WIN) / 2
  const left = (W - WIN * 2 - GAP) / 2

  return (
    <div className="absolute inset-0 flex items-center justify-center px-[var(--gutter)] pb-[clamp(72px,11vh,120px)] pt-[clamp(56px,8vh,96px)]">
      <div className="absolute left-[calc(var(--gutter)+4px)] right-[calc(var(--gutter)+4px)] top-[clamp(16px,3vh,28px)]">
        <PlaceholderBadge>Rebuilt from the Figma designs, Web Analytics content is placeholder</PlaceholderBadge>
      </div>
      <div
        ref={frameRef}
        className="relative w-full max-w-[1500px]"
        style={{ aspectRatio: `${stageW} / ${stageH}`, maxWidth: stacked ? `calc((100dvh - 220px) * ${stageW / stageH})` : undefined }}
        aria-hidden="true"
      >
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: stageW, height: stageH, transform: `scale(${scale})` }}>
          {/* Attribution: lands centered, then moves left to make room */}
          <motion.div
            className="absolute top-0"
            style={{ width: WIN }}
            initial={false}
            animate={{ left: 0, x: stacked ? 0 : on ? left : centered, opacity: on ? 1 : 0, y: on || reduced ? 0 : 40 }}
            transition={playing ? { x: { duration: reduced ? 0 : TIMING.move, delay: TIMING.slide, ease: EASE_DECK }, opacity: { duration: 0.6, delay: TIMING.first }, y: { duration: 0.9, delay: TIMING.first, ease: EASE_DECK } } : { duration: 0 }}
          >
            <Window crumb="Attribution" title="Getting started with Attribution" phase={phaseA} reduced={reduced} />
          </motion.div>
          {/* Web Analytics: the same pieces, beside it */}
          <motion.div
            className="absolute top-0"
            style={stacked ? { width: WIN, left: 0, top: H + GAP } : { width: WIN, left: left + WIN + GAP }}
            initial={false}
            animate={{ opacity: on ? 1 : 0, y: on || reduced ? 0 : 40 }}
            transition={tr(TIMING.slide + 0.2, 0.9)}
          >
            <Window
              crumb="Web Analytics"
              title="Getting started with Web Analytics"
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
        </div>
      </div>
    </div>
  )
}

/** One product window: top bar, the setup guide's heading and progress, and the waiting room's card. */
function Window({ crumb, title, phase, reduced, labels, cardTitle, cardBody }: { crumb: string; title: string; phase: number; reduced: boolean; labels?: ReactNode[]; cardTitle?: ReactNode; cardBody?: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[16px] bg-fp-bg font-fp text-fp-ink shadow-[0_24px_60px_rgba(0,0,0,0.45)]" style={{ fontSize: 14, height: H }}>
      <TopBar crumb={crumb} />
      <div className="mx-auto w-[700px] pt-[36px]">
        <p className="m-0 text-[12px] font-bold tracking-[0.6px] text-fp-indigo-soft">SETUP GUIDE</p>
        <h3 className="m-0 mt-[4px] text-[28px] font-semibold leading-normal tracking-[-0.56px]">{title}</h3>
        <Progress phase={phase} reduced={reduced} labels={labels} className="mt-[28px]" />
        <div className="mt-[36px] flex items-center gap-[14px]">
          <span className="text-[16px] font-semibold">{crumb}</span>
          <span className="rounded-full bg-fp-line px-[9px] py-[4px] text-[11px] font-semibold tracking-[0.02em]">PROCESSING</span>
        </div>
        <ProcessingCard reduced={reduced} className="mt-[14px] py-[28px]" title={cardTitle} body={cardBody} />
      </div>
    </div>
  )
}
