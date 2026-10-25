import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'
import type { VisualProps } from '../engine/types'
import { useVisualPlayback } from '../engine/useVisualPlayback'
import { HandCircle } from '../components/HandCircle'
import { PlaceholderBadge } from '../components/Placeholder'

/*
  Beat 4 visual: the empty-state montage. Six dashboard screengrabs drop onto the surface one at a time,
  each circled (magenta, hand-drawn) around its empty area with a short handwritten-style label.
  "Waiting on data" is marked differently (dashed circle and a question mark) because a later beat calls
  back to it. Then duplicates rain into a pile, the pile stops dead and holds, and six lines draw from the
  six circles to a single point beside the pile. Dummy dashboards only. Tune the timing here (seconds).
*/
export const TIMING = {
  start: 0.6,
  sixGap: 1.5, // between the first six, slow enough to read each label
  drop: 0.6,
  circleAfter: 0.45, // circle starts this long after its grab
  circleDraw: 0.7,
  labelAfter: 1.0, // label appears this long after its grab
  pileAfter: 1.4, // after the sixth grab lands
  dupCount: 18,
  dupGap: 0.1, // duplicates fall much faster
  dupDrop: 0.35,
  hold: 1.2, // the pile stops abruptly and holds
  lineGap: 0.12,
  lineDraw: 0.8,
  reducedHold: 0.3,
  reducedFade: 0.6,
}

type Kind = 'no-events' | 'events-undefined' | 'no-ad-sources' | 'ai-off' | 'ai-no-events' | 'waiting'
type Zone = { x: number; y: number; w: number; h: number } // percent of a grab

// zones of the mock dashboard, in percent of the grab
const Z = {
  kpis: { x: 4, y: 17, w: 92, h: 17 },
  chart: { x: 4, y: 38, w: 58, h: 32 },
  side: { x: 66, y: 38, w: 30, h: 32 },
  bottom: { x: 4, y: 74, w: 92, h: 20 },
  body: { x: 4, y: 17, w: 92, h: 77 },
}
const EMPTY_ZONE: Record<Kind, Zone> = {
  'no-events': Z.chart,
  'events-undefined': Z.kpis,
  'no-ad-sources': Z.side,
  'ai-off': Z.bottom,
  'ai-no-events': Z.bottom,
  waiting: Z.body,
}

// the six, in order, placed around the edges so the pile can form in the middle
const SIX: { kind: Kind; label: string; x: number; y: number; r: number }[] = [
  { kind: 'no-events', label: 'No events', x: 17, y: 22, r: -4 },
  { kind: 'events-undefined', label: 'Events not defined', x: 50, y: 20, r: 2 },
  { kind: 'no-ad-sources', label: 'No ad sources', x: 83, y: 22, r: -3 },
  { kind: 'ai-off', label: 'AI off', x: 17, y: 76, r: 3 },
  { kind: 'ai-no-events', label: 'AI on, no events', x: 50, y: 78, r: -2 },
  { kind: 'waiting', label: 'Waiting on data', x: 83, y: 76, r: 4 },
]
const GRAB_W = 22 // cqw; a grab is 16:10, so its height is 22% of the frame's height
const POINT = { x: 91, y: 49 } // where the six lines meet, beside the pile

// duplicates: deterministic scatter across the middle band
const DUPES = (() => {
  let seed = 7
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  const kinds: Kind[] = ['no-events', 'events-undefined', 'no-ad-sources', 'ai-off', 'ai-no-events']
  return Array.from({ length: TIMING.dupCount }, (_, i) => ({
    kind: kinds[i % kinds.length],
    x: 30 + rand() * 40,
    y: 41 + rand() * 18,
    r: -10 + rand() * 20,
  }))
})()

const sixAt = (i: number) => TIMING.start + i * TIMING.sixGap
const PILE_AT = sixAt(5) + TIMING.pileAfter
const LINES_AT = PILE_AT + (TIMING.dupCount - 1) * TIMING.dupGap + TIMING.dupDrop + TIMING.hold
const TOTAL = LINES_AT + 5 * TIMING.lineGap + TIMING.lineDraw + 0.2

/** Where a grab's circle sits, in frame percent (rotation ignored; it's small). */
function circleCenter(g: (typeof SIX)[number]) {
  const z = EMPTY_ZONE[g.kind]
  return { x: g.x + ((z.x + z.w / 2 - 50) / 100) * GRAB_W, y: g.y + ((z.y + z.h / 2 - 50) / 100) * 22 }
}

export function EmptyStateMontage(props: VisualProps) {
  const { reducedMotion: reduced } = props
  const mode = useVisualPlayback(props, reduced ? TIMING.reducedHold + TIMING.reducedFade : TOTAL)
  const on = mode !== 'empty'

  // one timing helper: staggered when playing, instant when stepping back in, one fade when reduced
  const at = (delay: number, duration: number) =>
    mode !== 'play' ? { duration: 0 } : reduced ? { duration: TIMING.reducedFade, delay: TIMING.reducedHold } : { duration, delay, ease: EASE_DECK }
  const drop = (delay: number, duration: number) => ({
    initial: false as const,
    animate: on ? { opacity: 1, scale: 1, y: '0cqw' } : { opacity: 0, scale: reduced ? 1 : 1.25, y: reduced ? '0cqw' : '-3cqw' },
    transition: at(delay, duration),
  })

  return (
    <div className="absolute inset-0 flex items-center justify-center px-[var(--gutter)] pb-[clamp(72px,11vh,120px)] pt-[clamp(56px,8vh,96px)]">
      <div className="absolute left-[calc(var(--gutter)+4px)] right-[calc(var(--gutter)+4px)] top-[clamp(16px,3vh,28px)]">
        <PlaceholderBadge>Placeholder dashboards, final screens to come</PlaceholderBadge>
      </div>
      <div
        className="relative"
        style={{ aspectRatio: '16 / 10', width: 'min(100%, calc((100dvh - clamp(56px,8vh,96px) - clamp(72px,11vh,120px)) * 1.6))', containerType: 'size' }}
        aria-hidden="true"
      >
        {/* the pile, under the six */}
        {DUPES.map((d, i) => (
          <Placed key={`d${i}`} x={d.x} y={d.y} r={d.r} w={16}>
            <motion.div {...drop(PILE_AT + i * TIMING.dupGap, TIMING.dupDrop)}>
              <Grab kind={d.kind} />
            </motion.div>
          </Placed>
        ))}

        {/* the six, each circled and labeled */}
        {SIX.map((g, i) => {
          const z = EMPTY_ZONE[g.kind]
          const waiting = g.kind === 'waiting'
          const top = g.y < 50
          return (
            <Placed key={g.kind} x={g.x} y={g.y} r={g.r} w={GRAB_W} z={10}>
              <motion.div {...drop(sixAt(i), TIMING.drop)}>
                <Grab kind={g.kind} />
              </motion.div>
              {/* circle sized to the empty zone, slightly larger */}
              <CircleBox zone={z}>
                <HandCircle
                  show={on}
                  instant={mode !== 'play'}
                  reducedMotion={reduced}
                  delay={sixAt(i) + TIMING.circleAfter}
                  duration={TIMING.circleDraw}
                  variant={i}
                  dashed={waiting}
                  className="inset-0 h-full w-full"
                />
                {waiting && (
                  <motion.span
                    className="absolute inset-0 grid place-items-center text-[5cqw] font-bold italic leading-none text-annotation"
                    initial={false}
                    animate={on ? { opacity: 1, scale: 1, rotate: 8 } : { opacity: 0, scale: reduced ? 1 : 0.6, rotate: 8 }}
                    transition={at(sixAt(i) + TIMING.circleAfter + TIMING.circleDraw * 0.6, 0.5)}
                  >
                    ?
                  </motion.span>
                )}
              </CircleBox>
              <motion.span
                className={`absolute left-1/2 whitespace-nowrap text-[clamp(10px,1.55cqw,22px)] font-semibold italic text-annotation ${top ? 'bottom-[calc(100%+0.8cqw)]' : 'top-[calc(100%+0.8cqw)]'}`}
                style={{ x: '-50%', rotate: -3 }}
                initial={false}
                animate={{ opacity: on ? 1 : 0 }}
                transition={at(sixAt(i) + TIMING.labelAfter, 0.5)}
              >
                {g.label}
              </motion.span>
            </Placed>
          )
        })}

        {/* six lines to one point */}
        {SIX.map((g, i) => {
          const c = circleCenter(g)
          const dx = POINT.x - c.x
          const dy = (POINT.y - c.y) * 0.625 // frame height is 62.5cqw
          const len = Math.hypot(dx, dy)
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI
          return (
            <div
              key={`l${i}`}
              className="absolute z-20 h-[2px] origin-left"
              style={{ left: `${c.x}%`, top: `${c.y}%`, width: `${len}cqw`, transform: `rotate(${angle}deg)` }}
            >
              <motion.span
                className="block h-full w-full origin-left rounded-full bg-annotation"
                initial={false}
                animate={{ scaleX: on ? 1 : reduced ? 1 : 0, opacity: on ? 1 : 0 }}
                transition={at(LINES_AT + i * TIMING.lineGap, TIMING.lineDraw)}
              />
            </div>
          )
        })}
        <motion.span
          className="absolute z-20 block h-[1.4cqw] w-[1.4cqw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-annotation shadow-[0_0_0_0.6cqw_color-mix(in_srgb,var(--color-annotation)_25%,transparent)]"
          style={{ left: `${POINT.x}%`, top: `${POINT.y}%` }}
          initial={false}
          animate={on ? { opacity: 1, scale: 1 } : { opacity: 0, scale: reduced ? 1 : 0.4 }}
          transition={at(LINES_AT + TIMING.lineDraw * 0.7, 0.4)}
        />
      </div>
    </div>
  )
}

/** Positions something by its center in frame percent, with a resting rotation. */
function Placed({ x, y, r, w, z = 1, children }: { x: number; y: number; r: number; w: number; z?: number; children: ReactNode }) {
  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%`, width: `${w}cqw`, zIndex: z, transform: `translate(-50%, -50%) rotate(${r}deg)` }}>
      {children}
    </div>
  )
}

/** A box over a grab's empty zone, padded so the circle sits just outside it. */
function CircleBox({ zone, children }: { zone: Zone; children: ReactNode }) {
  const pad = 5
  return (
    <div className="pointer-events-none absolute" style={{ left: `${zone.x - pad}%`, top: `${zone.y - pad}%`, width: `${zone.w + pad * 2}%`, height: `${zone.h + pad * 2}%` }}>
      {children}
    </div>
  )
}

/** A dummy Attribution screengrab with one area empty (or, for "waiting", everything still loading). */
function Grab({ kind }: { kind: Kind }) {
  const empty = (z: keyof typeof Z) => EMPTY_ZONE[kind] === Z[z] && kind !== 'ai-no-events' && kind !== 'waiting'
  const waiting = kind === 'waiting'
  const box = (z: Zone) => ({ left: `${z.x}%`, top: `${z.y}%`, width: `${z.w}%`, height: `${z.h}%` })
  const dashed = 'rounded-[4%] border border-dashed border-line-strong bg-surface-2'
  const sk = 'rounded-[3px] bg-skeleton'
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[0.6cqw] bg-surface shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
      <div className="absolute inset-x-0 top-0 flex h-[11%] items-center gap-[3%] border-b border-line px-[3%]">
        <span className="block aspect-square h-[46%] rounded-[20%] bg-product-ink" />
        <span className={`block h-[26%] w-[20%] rounded-full ${waiting ? 'bg-skeleton' : 'bg-skeleton-strong'}`} />
      </div>

      <div className="absolute grid grid-cols-4 gap-[3%]" style={box(Z.kpis)}>
        {[0, 1, 2, 3].map((k) =>
          empty('kpis') ? (
            <div key={k} className={dashed} />
          ) : (
            <div key={k} className="flex flex-col justify-end gap-[14%] rounded-[6%] border border-line p-[8%]">
              <span className={`block h-[24%] w-[70%] ${waiting ? sk : 'rounded-[2px] bg-product-ink'}`} />
              <span className={`block h-[14%] w-[45%] rounded-full ${waiting ? 'bg-skeleton' : 'bg-product-tint'}`} />
            </div>
          ),
        )}
      </div>

      <div className="absolute" style={box(Z.chart)}>
        {empty('chart') ? (
          <div className={`h-full ${dashed}`} />
        ) : (
          <div className="relative h-full overflow-hidden rounded-[4%] border border-line">
            {waiting ? (
              <div className="absolute inset-[12%] flex flex-col justify-end gap-[10%]">
                <span className={`block h-[10%] w-[80%] ${sk}`} />
                <span className={`block h-[10%] w-[60%] ${sk}`} />
              </div>
            ) : (
              <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[70%] w-full">
                <path d="M0,40 C15,36 25,42 40,32 S65,24 80,18 S95,12 100,10 L100,50 L0,50 Z" fill="var(--color-product-mint)" opacity="0.4" />
                <path d="M0,40 C15,36 25,42 40,32 S65,24 80,18 S95,12 100,10" fill="none" stroke="var(--color-product)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              </svg>
            )}
          </div>
        )}
      </div>

      <div className="absolute" style={box(Z.side)}>
        {empty('side') ? (
          <div className={`h-full ${dashed}`} />
        ) : (
          <div className="flex h-full items-end gap-[8%] rounded-[4%] border border-line p-[10%]">
            {[50, 70, 60, 90].map((h, b) => (
              <span key={b} className={`block flex-1 rounded-t-[2px] ${waiting ? 'bg-skeleton' : 'bg-product-mint'}`} style={{ height: `${h}%` }} />
            ))}
          </div>
        )}
      </div>

      <div className="absolute grid grid-cols-3 gap-[3%]" style={box(Z.bottom)}>
        {empty('bottom') ? (
          <div className={`col-span-3 ${dashed}`} />
        ) : (
          [0, 1, 2].map((c) =>
            kind === 'ai-no-events' ? (
              // recommendation cards switched on, but nothing to say: hollow shells
              <div key={c} className="rounded-[6%] border border-dashed border-line-strong" />
            ) : (
              <div key={c} className="flex flex-col justify-center gap-[14%] rounded-[6%] border border-line px-[8%]">
                <span className={`block h-[14%] w-[40%] rounded-full ${waiting ? 'bg-skeleton' : 'bg-product-tint'}`} />
                <span className={`block h-[14%] w-[85%] ${sk}`} />
              </div>
            ),
          )
        )}
      </div>
    </div>
  )
}

