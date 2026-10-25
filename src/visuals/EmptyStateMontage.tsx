import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'
import type { VisualProps } from '../engine/types'
import { useVisualPlayback } from '../engine/useVisualPlayback'
import { HandCircle } from '../components/HandCircle'
import { PlaceholderBadge } from '../components/Placeholder'

/*
  Beat 4 visual: the empty-state montage, as a stack of screengrabs on a table. One large dummy dashboard
  falls and lands slightly askew; its empty area gets a hand-drawn magenta circle and a short label. The
  next falls on top, a little offset, and the one beneath dims as it's covered. The first six land slowly
  enough to read; "Waiting on data" is marked differently (dashed circle, question mark) because a later
  beat calls back to it. Then more keep coming, faster and faster, circled without labels, until the stack
  holds. Dummy dashboards only. Tune the timing here (seconds).
*/
export const TIMING = {
  start: 0.5,
  sixGap: 1.7, // between the first six, slow enough to read each label
  fall: 0.55,
  circleAfter: 0.45, // circle starts this long after its grab begins to fall
  circleDraw: 0.6,
  labelAfter: 0.95,
  dupCount: 12, // after the six: more keep coming
  dupFirstGap: 0.8, // first gap after the six, then each gap shrinks
  dupAccel: 0.8, // each gap is this fraction of the one before
  dupMinGap: 0.16,
  dupCircleAfter: 0.25,
  dupCircleDraw: 0.35,
  hold: 0.9, // the stack holds before the overlay
  coverDim: 0.5, // how dark a covered grab gets
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

const SIX: { kind: Kind; label: string }[] = [
  { kind: 'no-events', label: 'No events' },
  { kind: 'events-undefined', label: 'Events not defined' },
  { kind: 'no-ad-sources', label: 'No ad sources' },
  { kind: 'ai-off', label: 'AI off' },
  { kind: 'ai-no-events', label: 'AI on, no events' },
  { kind: 'waiting', label: 'Waiting on data' },
]
const GRAB_W = 58 // cqw: one large screengrab at a time

// the whole stack: the six, then duplicates; each with a deterministic resting offset and tilt
const STACK = (() => {
  let seed = 11
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  const dupKinds: Kind[] = ['no-events', 'events-undefined', 'no-ad-sources', 'ai-off', 'ai-no-events']
  const items: { kind: Kind; label?: string; at: number; dx: number; dy: number; r: number; quick: boolean }[] = []
  SIX.forEach((g, i) => items.push({ ...g, at: TIMING.start + i * TIMING.sixGap, dx: 0, dy: 0, r: 0, quick: false }))
  let t = TIMING.start + 5 * TIMING.sixGap
  let gap = TIMING.dupFirstGap + TIMING.labelAfter
  for (let i = 0; i < TIMING.dupCount; i++) {
    t += gap
    items.push({ kind: dupKinds[i % dupKinds.length], at: t, dx: 0, dy: 0, r: 0, quick: true })
    gap = Math.max(TIMING.dupMinGap, (i === 0 ? TIMING.dupFirstGap : gap) * TIMING.dupAccel)
  }
  return items.map((it) => ({ ...it, dx: -5 + rand() * 10, dy: -3 + rand() * 6, r: -6 + rand() * 12 }))
})()
const LAST = STACK[STACK.length - 1]
const TOTAL = LAST.at + TIMING.fall + TIMING.dupCircleAfter + TIMING.dupCircleDraw + TIMING.hold

export function EmptyStateMontage(props: VisualProps) {
  const { reducedMotion: reduced } = props
  const mode = useVisualPlayback(props, TOTAL)
  const on = mode !== 'empty'
  const playing = mode === 'play'

  // same timeline with or without reduced motion; reduced just drops the fall (opacity only)
  const at = (delay: number, duration: number) => (playing ? { duration: reduced ? 0.3 : duration, delay, ease: EASE_DECK } : { duration: 0 })

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
        {STACK.map((g, i) => {
          const next = STACK[i + 1]
          const waiting = g.kind === 'waiting'
          return (
            <div
              key={i}
              className="absolute left-1/2 top-1/2"
              style={{ width: `${GRAB_W}cqw`, zIndex: i + 1, transform: `translate(calc(-50% + ${g.dx}cqw), calc(-50% + ${g.dy}cqw)) rotate(${g.r}deg)` }}
            >
              <motion.div
                className="relative"
                initial={false}
                animate={on ? { opacity: 1, scale: 1, y: '0cqw', filter: 'blur(0px)' } : { opacity: 0, scale: reduced ? 1 : 1.35, y: reduced ? '0cqw' : '-5cqw', filter: reduced ? 'blur(0px)' : 'blur(6px)' }}
                transition={at(g.at, TIMING.fall)}
              >
                <Grab kind={g.kind} />
                <CircleBox zone={EMPTY_ZONE[g.kind]}>
                  <HandCircle
                    show={on}
                    instant={!playing}
                    reducedMotion={reduced}
                    delay={g.at + (g.quick ? TIMING.dupCircleAfter : TIMING.circleAfter)}
                    duration={g.quick ? TIMING.dupCircleDraw : TIMING.circleDraw}
                    variant={i}
                    dashed={waiting}
                    className="inset-0 h-full w-full"
                  />
                  {waiting && (
                    <motion.span
                      className="absolute inset-0 grid place-items-center text-[8cqw] font-bold italic leading-none text-annotation"
                      initial={false}
                      animate={on ? { opacity: 1, scale: 1, rotate: 8 } : { opacity: 0, scale: reduced ? 1 : 0.6, rotate: 8 }}
                      transition={at(g.at + TIMING.circleAfter + TIMING.circleDraw * 0.6, 0.45)}
                    >
                      ?
                    </motion.span>
                  )}
                  {g.label && (
                    <motion.span
                      className="absolute bottom-[calc(100%+0.6cqw)] left-[2%] whitespace-nowrap rounded-[0.4cqw] bg-surface/90 px-[0.6cqw] text-[clamp(11px,2.3cqw,32px)] font-semibold italic text-annotation"
                      style={{ rotate: -3 }}
                      initial={false}
                      animate={{ opacity: on ? 1 : 0 }}
                      transition={at(g.at + TIMING.labelAfter, 0.45)}
                    >
                      {g.label}
                    </motion.span>
                  )}
                </CircleBox>
                {/* dims once the next grab lands on top of it */}
                {next && (
                  <motion.div
                    className="pointer-events-none absolute inset-0 rounded-[0.6cqw] bg-card-to"
                    initial={false}
                    animate={{ opacity: on ? TIMING.coverDim : 0 }}
                    transition={at(next.at + TIMING.fall * 0.6, 0.4)}
                  />
                )}
              </motion.div>
            </div>
          )
        })}
      </div>
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

