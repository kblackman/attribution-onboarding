import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'
import type { VisualProps } from '../engine/types'
import { useVisualPlayback } from '../engine/useVisualPlayback'
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

/*
  Two lanes (Kyle, 2026-11-08: make it clear you leave Attribution in the in-between steps): the top lane is
  inside Attribution (every screenshot, plus Event Definition, a drawer on the page, dipping just below the row
  without crossing the line), the bottom lane is outside
  it (Event Creation on the Events page, Sources, AI settings). The flow runs left to right and dips into the
  bottom lane each time the customer leaves, so the three exits show without reading a note.
  Layout in percent of the board (x of width, y of height).
*/
const SHOT_W = 11.4 // cqw
const STEP_W = 9 // cqw
const LANE_SPLIT = 50 // the divider, percent of board height
const TOP_Y = 23
const DRAWER_Y = 40 // Event Definition: a drawer on the Attribution page, so a shallow dip that stays in the top lane
const BOTTOM_Y = 72
type Item = ({ kind: 'shot'; shot: string } | { kind: 'step'; label: string }) & { x: number; y: number }
const top = (x: number) => ({ x, y: TOP_Y })
const bottom = (x: number) => ({ x, y: BOTTOM_Y })
const FLOW: Item[] = [
  { kind: 'shot', shot: 'No events', ...top(8.3) },
  { kind: 'step', label: 'Event Creation', ...bottom(16.3) },
  { kind: 'shot', shot: 'Events not defined', ...top(24.3) },
  { kind: 'step', label: 'Event Definition', x: 34, y: DRAWER_Y },
  { kind: 'shot', shot: 'Waiting on data', ...top(43.7) },
  { kind: 'shot', shot: 'No ad sources', ...top(59.7) },
  { kind: 'step', label: 'Sources', ...bottom(67.7) },
  { kind: 'shot', shot: 'AI off', ...top(75.7) },
  { kind: 'step', label: 'AI settings', ...bottom(83.7) },
  { kind: 'shot', shot: 'AI on, no events', ...top(91.7) },
]
// friction points: a handwritten note beside a step (index into FLOW), with an arrow to it.
// Kyle's wording (2026-10-25), each under a "UX Gap:" label. side: where the note sits relative to its step.
const NOTE_LABEL = 'UX Gap:'
const NOTES: { at: number; text: string; side: 'below' | 'left' | 'right'; r: number }[] = [
  { at: 1, text: 'Leaving Attribution to create events', side: 'right', r: -3 },
  { at: 6, text: 'No way back after connecting', side: 'left', r: 3 },
  { at: 8, text: 'Leaving Attribution to turn on AI', side: 'below', r: -3 },
]

const shots = FLOW.filter((f) => f.kind === 'shot')
const stepsOnly = FLOW.filter((f) => f.kind === 'step')
const STEPS_AT = TIMING.start + shots.length * TIMING.shotGap + TIMING.stepsAfter
const ARROWS_AT = STEPS_AT + stepsOnly.length * TIMING.stepGap + TIMING.arrowsAfter
const NOTES_AT = ARROWS_AT + (FLOW.length - 1) * TIMING.arrowGap + TIMING.arrowDraw + TIMING.notesAfter
const TOTAL = NOTES_AT + NOTES.length * TIMING.noteGap + TIMING.settle

const LANE = 'absolute left-[2cqw] text-[clamp(9px,1.15cqw,17px)] font-bold uppercase tracking-[0.12em] text-ink-2'
const halfW = (f: Item) => (f.kind === 'shot' ? SHOT_W : STEP_W) / 2
// wider than the old 16:10, so the lanes use the screen's width and the screenshots stay readable
const ASPECT = 1.9
const halfH = (f: Item) => ((f.kind === 'shot' ? (SHOT_W * 10) / 16 : 5) / 2 / (100 / ASPECT)) * 100 // percent of board height
// the board is 100cqw wide
const BOARD_H = 100 / ASPECT
/** An arrow from item a's edge to item b's edge, at any angle (lane changes run on the diagonal). */
function arrowBetween(a: Item, b: Item) {
  const ax = a.x, ay = (a.y / 100) * BOARD_H, bx = b.x, by = (b.y / 100) * BOARD_H
  const dx = bx - ax, dy = by - ay
  const dist = Math.hypot(dx, dy)
  const edge = (f: Item) => {
    const hw = halfW(f), hh = (halfH(f) / 100) * BOARD_H
    return Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity) * dist
  }
  const pad = 1
  const from = edge(a) + pad
  const len = dist - from - edge(b) - pad
  return { x: ax + (dx / dist) * from, y: ((ay + (dy / dist) * from) / BOARD_H) * 100, len, deg: (Math.atan2(dy, dx) * 180) / Math.PI }
}

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
      <div
        className="relative overflow-hidden rounded-[1.2cqw] bg-surface-2 shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
        style={{
          aspectRatio: `${ASPECT}`,
          width: `min(100%, calc((100dvh - clamp(56px,8vh,96px) - clamp(72px,11vh,120px)) * ${ASPECT}))`,
          containerType: 'size',
          backgroundImage: 'radial-gradient(var(--color-caption) 1.4px, transparent 1.4px)', // whiteboard dots, visible but quiet
          backgroundSize: '2.2cqw 2.2cqw',
        }}
        aria-hidden="true"
      >
        {/* the two lanes: inside Attribution on top, outside it below (tinted), with their labels */}
        <div className="absolute inset-x-0 bottom-0 bg-line/70" style={{ top: `${LANE_SPLIT}%` }} />
        <div className="absolute inset-x-0 border-t-2 border-dashed border-line-strong" style={{ top: `${LANE_SPLIT}%` }} />
        <motion.div className="contents" {...pop(TIMING.start * 0.5, 1)}>
          <span className={LANE} style={{ top: '3.2%' }}>In Attribution</span>
          <span className={LANE} style={{ top: `${LANE_SPLIT + 3.2}%` }}>Outside Attribution</span>
        </motion.div>

        {/* arrows between consecutive items */}
        {FLOW.slice(0, -1).map((a, i) => {
          const { x, y, len, deg } = arrowBetween(a, FLOW[i + 1])
          return (
            <Arrow key={i} x={x} y={y} len={len} deg={deg}>
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
          // anchored at the step's edge on the note's side; the arrow points back at the step
          const pos =
            n.side === 'below'
              ? { left: `${f.x}%`, top: `${f.y + halfH(f) + 1}%`, transform: 'translate(-50%, 0)' }
              : n.side === 'left'
                ? { left: `${f.x - halfW(f) - 0.6}%`, top: `${f.y}%`, transform: 'translate(-100%, -50%)' }
                : { left: `${f.x + halfW(f) + 0.6}%`, top: `${f.y}%`, transform: 'translate(0, -50%)' }
          const flow = n.side === 'below' ? 'flex-col-reverse' : n.side === 'left' ? 'flex-row' : 'flex-row-reverse'
          const turn = n.side === 'below' ? 'rotate-180' : n.side === 'left' ? '-rotate-90' : 'rotate-90'
          return (
            <div key={`n${i}`} className="absolute z-30 flex w-[15cqw] justify-center" style={pos}>
              <motion.div className={`flex items-center ${flow}`} {...pop(NOTES_AT + i * TIMING.noteGap, 0.9)}>
                <span
                  className="block text-center font-[family-name:var(--font-hand)] text-[clamp(11px,1.75cqw,30px)] font-bold leading-[1.05] text-annotation"
                  style={{ transform: `rotate(${n.r}deg)` }}
                >
                  <span className="block">{NOTE_LABEL}</span>
                  {n.text}
                </span>
                <svg viewBox="0 0 30 34" className={`h-[3.2cqw] w-[2.8cqw] flex-none overflow-visible ${turn}`} aria-hidden="true">
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
