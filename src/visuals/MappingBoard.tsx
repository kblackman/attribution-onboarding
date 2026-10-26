import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'
import type { VisualProps } from '../engine/types'
import { useVisualPlayback } from '../engine/useVisualPlayback'
import { PlaceholderBadge } from '../components/Placeholder'
import { ShotView, shotByLabel } from './EmptyStateMontage'

/*
  Beat 6 visual ("Connecting the dots"): the method, not the result. A generic whiteboard (not FigJam's UI).
  The empty-state screenshots from the montage drop on as anchor points, circles and labels intact;
  step boxes fill the gaps between them; arrows draw in to connect everything; handwritten magenta notes
  with arrows call out the friction points (Kyle's markup, as on the montage). Real screenshots swapped into SHOTS appear here too. Tune the timing here (seconds).
*/
export const TIMING = {
  start: 0.4,
  shotGap: 0.35,
  stepsAfter: 0.4, // after the last screenshot
  stepGap: 0.2,
  arrowsAfter: 0.3, // after the last step box
  arrowGap: 0.14,
  arrowDraw: 0.45,
  notesAfter: 0.3, // after the last arrow
  noteGap: 0.45,
  settle: 0.8,
}

// layout in percent of the board (x of width, y of height); a two-row snake, left to right then back
const SHOT_W = 14 // cqw
const STEP_W = 11 // cqw
type Item = { kind: 'shot'; shot: string; x: number; y: number } | { kind: 'step'; label: string; x: number; y: number }
const FLOW: Item[] = [
  { kind: 'shot', shot: 'No events', x: 10, y: 28 }, // No events
  { kind: 'step', label: 'Event Creation', x: 28, y: 28 },
  { kind: 'shot', shot: 'Events not defined', x: 46, y: 28 }, // Events not defined
  { kind: 'step', label: 'Event Definition', x: 64, y: 28 },
  { kind: 'shot', shot: 'Waiting on data', x: 84, y: 28 }, // Waiting on data
  { kind: 'shot', shot: 'No ad sources', x: 84, y: 74 }, // No ad sources
  { kind: 'step', label: 'Sources', x: 64, y: 74 },
  { kind: 'shot', shot: 'AI off', x: 46, y: 74 }, // AI off
  { kind: 'step', label: 'AI settings', x: 28, y: 74 },
  { kind: 'shot', shot: 'AI on, no events', x: 10, y: 74 }, // AI on, no events
]
// friction points: a handwritten note above or below a step (index into FLOW), with an arrow to it.
// Kyle's wording (2026-10-25), each under a "UX Gap:" label.
const NOTE_LABEL = 'UX Gap:'
const NOTES: { at: number; text: string; side: 'above' | 'below'; r: number }[] = [
  { at: 1, text: 'Leaving Attribution to create events', side: 'above', r: -4 },
  { at: 6, text: 'No way back after connecting', side: 'below', r: 3 },
  { at: 8, text: 'Leaving Attribution to turn on AI', side: 'below', r: -3 },
]

const shots = FLOW.filter((f) => f.kind === 'shot')
const stepsOnly = FLOW.filter((f) => f.kind === 'step')
const STEPS_AT = TIMING.start + shots.length * TIMING.shotGap + TIMING.stepsAfter
const ARROWS_AT = STEPS_AT + stepsOnly.length * TIMING.stepGap + TIMING.arrowsAfter
const NOTES_AT = ARROWS_AT + (FLOW.length - 1) * TIMING.arrowGap + TIMING.arrowDraw + TIMING.notesAfter
const TOTAL = NOTES_AT + NOTES.length * TIMING.noteGap + TIMING.settle

const halfW = (f: Item) => (f.kind === 'shot' ? SHOT_W : STEP_W) / 2
const halfH = (f: Item) => (f.kind === 'shot' ? (SHOT_W * 10) / 16 : 5) / 2 / 0.625 // percent of board height

export function MappingBoard(props: VisualProps) {
  const { reducedMotion: reduced } = props
  const mode = useVisualPlayback(props, reduced ? 0.8 : TOTAL)
  const on = mode !== 'empty'
  const playing = mode === 'play'
  const at = (delay: number, duration: number) =>
    !playing ? { duration: 0 } : reduced ? { duration: 0.4, delay: 0.3 } : { duration, delay, ease: EASE_DECK }
  const pop = (delay: number, from = 0.85) => ({
    initial: false as const,
    animate: on ? { opacity: 1, scale: 1 } : { opacity: 0, scale: reduced ? 1 : from },
    transition: at(delay, 0.45),
  })

  let shotIdx = 0
  let stepIdx = 0

  return (
    <div className="absolute inset-0 flex items-center justify-center px-[var(--gutter)] pb-[clamp(72px,11vh,120px)] pt-[clamp(56px,8vh,96px)]">
      <div className="absolute left-[calc(var(--gutter)+4px)] right-[calc(var(--gutter)+4px)] top-[clamp(16px,3vh,28px)]">
        <PlaceholderBadge>Recreated screens, mock data</PlaceholderBadge>
      </div>
      <div
        className="relative overflow-hidden rounded-[1.2cqw] bg-surface-2 shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
        style={{
          aspectRatio: '16 / 10',
          width: 'min(100%, calc((100dvh - clamp(56px,8vh,96px) - clamp(72px,11vh,120px)) * 1.6))',
          containerType: 'size',
          backgroundImage: 'radial-gradient(var(--color-caption) 1.4px, transparent 1.4px)', // whiteboard dots, visible but quiet
          backgroundSize: '2.2cqw 2.2cqw',
        }}
        aria-hidden="true"
      >
        {/* arrows between consecutive items */}
        {FLOW.slice(0, -1).map((a, i) => {
          const b = FLOW[i + 1]
          const vertical = a.x === b.x
          const dir = vertical ? 90 : b.x > a.x ? 0 : 180
          const start = vertical
            ? { x: a.x, y: a.y + halfH(a) + 1.5 }
            : { x: a.x + (b.x > a.x ? halfW(a) + 1 : -halfW(a) - 1), y: a.y }
          const len = vertical
            ? (b.y - halfH(b) - 1.5 - start.y) * 0.625 // board height is 62.5cqw
            : Math.abs(b.x - a.x) - halfW(a) - halfW(b) - 2
          return (
            <Arrow key={i} x={start.x} y={start.y} len={len} deg={dir}>
              <motion.span
                className="absolute inset-0 origin-left"
                initial={false}
                animate={{ scaleX: on || reduced ? 1 : 0, opacity: on ? 1 : 0 }}
                transition={at(ARROWS_AT + i * TIMING.arrowGap, TIMING.arrowDraw)}
              >
                <span className="absolute inset-y-0 left-0 right-[0.6cqw] my-auto h-[2px] rounded-full bg-ink-2" />
                <span className="absolute right-0 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[0.55cqw] border-l-[0.8cqw] border-y-transparent border-l-ink-2" />
              </motion.span>
            </Arrow>
          )
        })}

        {FLOW.map((f, i) => {
          if (f.kind === 'shot') {
            const n = shotIdx++
            const d = TIMING.start + n * TIMING.shotGap
            return (
              <Placed key={i} x={f.x} y={f.y} w={SHOT_W}>
                <motion.div
                  initial={false}
                  animate={on ? { opacity: 1, scale: 1, y: '0%' } : { opacity: 0, scale: reduced ? 1 : 1.2, y: reduced ? '0%' : '-10%' }}
                  transition={at(d, 0.5)}
                >
                  <ShotView shot={shotByLabel(f.shot)} show={on} instant={!playing} reducedMotion={reduced} delay={d + 0.3} circleDuration={0.45} variant={n} />
                </motion.div>
              </Placed>
            )
          }
          const n = stepIdx++
          return (
            <Placed key={i} x={f.x} y={f.y} w={STEP_W}>
              <motion.div
                className="grid h-[5cqw] place-items-center rounded-[0.8cqw] border border-line-strong bg-surface px-[0.6cqw] text-center text-[clamp(10px,1.35cqw,20px)] font-bold leading-tight text-ink shadow-[0_4px_12px_rgba(20,21,28,0.08)]"
                {...pop(STEPS_AT + n * TIMING.stepGap)}
              >
                {f.label}
              </motion.div>
            </Placed>
          )
        })}

        {/* friction points: Kyle's handwritten notes, each with an arrow to its step */}
        {NOTES.map((n, i) => {
          const f = FLOW[n.at]
          const edge = f.y + (n.side === 'above' ? -halfH(f) - 1 : halfH(f) + 1) // percent of board height
          return (
            <div
              key={`n${i}`}
              className="absolute z-30 flex w-[17cqw] flex-col items-center"
              style={{ left: `${f.x}%`, top: `${edge}%`, transform: `translate(-50%, ${n.side === 'above' ? '-100%' : '0'})` }}
            >
              <motion.div className={`flex items-center ${n.side === 'below' ? 'flex-col-reverse' : 'flex-col'}`} {...pop(NOTES_AT + i * TIMING.noteGap, 0.9)}>
                <span
                  className="block text-center font-[family-name:var(--font-hand)] text-[clamp(11px,1.75cqw,30px)] font-bold leading-[1.05] text-annotation"
                  style={{ transform: `rotate(${n.r}deg)` }}
                >
                  <span className="block">{NOTE_LABEL}</span>
                  {n.text}
                </span>
                <svg viewBox="0 0 30 34" className={`h-[3.2cqw] w-[2.8cqw] overflow-visible ${n.side === 'below' ? 'mb-[0.3cqw] rotate-180' : 'mt-[0.3cqw]'}`} aria-hidden="true">
                  <g fill="none" stroke="var(--color-annotation)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2 C9 12 9 22 15 31" vectorEffect="non-scaling-stroke" />
                    <path d="M9 25 L15 31 L20 24" vectorEffect="non-scaling-stroke" />
                  </g>
                </svg>
              </motion.div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Positions something by its center in board percent. */
function Placed({ x, y, w, r = 0, z = 10, children }: { x: number; y: number; w: number; r?: number; z?: number; children: ReactNode }) {
  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%`, width: `${w}cqw`, zIndex: z, transform: `translate(-50%, -50%) rotate(${r}deg)` }}>
      {children}
    </div>
  )
}

/** An arrow starting at (x, y) in board percent, `len` cqw long, pointing `deg` degrees. */
function Arrow({ x, y, len, deg, children }: { x: number; y: number; len: number; deg: number; children: ReactNode }) {
  return (
    <div className="absolute z-[5] h-[1.2cqw]" style={{ left: `${x}%`, top: `${y}%`, width: `${len}cqw`, transformOrigin: '0 50%', transform: `translateY(-50%) rotate(${deg}deg)` }}>
      {children}
    </div>
  )
}
