import { motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'
import type { VisualProps } from '../engine/types'
import { useVisualPlayback } from '../engine/useVisualPlayback'
import { Annotation, type Zone } from '../components/Annotation'
import { PlaceholderBadge } from '../components/Placeholder'

/*
  Beat 4 visual: the empty-state montage, as a stack of screenshots on a table. One large screenshot falls
  and lands slightly askew; its empty area gets a hand-drawn magenta circle, a handwritten label, and an
  arrow. The next falls on top, a little offset, and the one beneath dims as it's covered. The first six
  land slowly enough to read; "Waiting on data" is marked differently (dashed circle, question mark)
  because a later beat calls back to it. Then more keep coming, faster and faster, until the stack holds.

  SWAPPING IN REAL SCREENSHOTS: put the file in public/assets/hunch/, then on its entry in SHOTS set
  `src` to its filename and `aspect` to its width / height. `empty` is the empty area in percent of the
  image, so measure it on the real screenshot. Screenshots can be any size or shape: each is fitted
  inside the stage keeping its own proportions, and the circle, label, and arrow follow it.
  `labelAt` (percent of the image) moves a label if the automatic spot doesn't suit.
*/
export interface Shot {
  label: string
  /** The empty area to circle, in percent of the image. */
  empty: Zone
  /** File in public/assets/hunch/. Leave out to show the placeholder dashboard. */
  src?: string
  /** Image width / height. Placeholders are 16 / 10. */
  aspect?: number
  /** Which placeholder dashboard to draw while there's no src. */
  placeholder?: Kind
  labelAt?: { x: number; y: number }
  /** Mark as different from the rest (dashed circle and question mark). */
  question?: boolean
}

type Kind = 'no-events' | 'events-undefined' | 'no-ad-sources' | 'ai-off' | 'ai-no-events' | 'waiting'

// zones of the placeholder dashboard, in percent of the image
const Z = {
  kpis: { x: 4, y: 17, w: 92, h: 17 },
  chart: { x: 4, y: 38, w: 58, h: 32 },
  side: { x: 66, y: 38, w: 30, h: 32 },
  bottom: { x: 4, y: 74, w: 92, h: 20 },
  body: { x: 4, y: 17, w: 92, h: 77 },
}

/** The six, in order. Swap in real screenshots here (see above). */
export const SHOTS: Shot[] = [
  { label: 'No events', placeholder: 'no-events', empty: Z.chart },
  { label: 'Events not defined', placeholder: 'events-undefined', empty: Z.kpis },
  { label: 'No ad sources', placeholder: 'no-ad-sources', empty: Z.side },
  { label: 'AI off', placeholder: 'ai-off', empty: Z.bottom },
  { label: 'AI on, no events', placeholder: 'ai-no-events', empty: Z.bottom },
  { label: 'Waiting on data', placeholder: 'waiting', empty: Z.body, question: true, labelAt: { x: 70, y: 8 } },
]

export const TIMING = {
  start: 0.5,
  sixGap: 1.9, // between the first six, slow enough to read each label
  fall: 0.55,
  circleAfter: 0.45, // circle starts this long after its screenshot begins to fall
  circleDraw: 0.6,
  dupCount: 12, // after the six: more keep coming (the same screenshots again)
  dupFirstGap: 0.8, // first gap after the six, then each gap shrinks
  dupAccel: 0.8, // each gap is this fraction of the one before
  dupMinGap: 0.16,
  dupCircleAfter: 0.25,
  dupCircleDraw: 0.35,
  hold: 0.9, // the stack holds before the overlay
  coverDim: 0.5, // how dark a covered screenshot gets
}

// the stage: each screenshot fits inside this box (cqw of the frame), keeping its own proportions
const MAX_W = 80
const MAX_H = 52

const asset = (file: string) => `${import.meta.env.BASE_URL}assets/hunch/${file}`

// the whole stack: the six, then repeats of the first five (no labels), each with a resting offset and tilt
const STACK = (() => {
  let seed = 11
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  const items: { shot: Shot; at: number; quick: boolean; dx: number; dy: number; r: number }[] = []
  SHOTS.forEach((shot, i) => items.push({ shot, at: TIMING.start + i * TIMING.sixGap, quick: false, dx: 0, dy: 0, r: 0 }))
  let t = TIMING.start + 5 * TIMING.sixGap
  let gap = TIMING.dupFirstGap + 1.2
  const repeats = SHOTS.filter((s) => !s.question)
  for (let i = 0; i < TIMING.dupCount; i++) {
    t += gap
    items.push({ shot: repeats[i % repeats.length], at: t, quick: true, dx: 0, dy: 0, r: 0 })
    gap = Math.max(TIMING.dupMinGap, (i === 0 ? TIMING.dupFirstGap : gap) * TIMING.dupAccel)
  }
  return items.map((it) => ({ ...it, dx: -4 + rand() * 8, dy: -2.5 + rand() * 5, r: -5 + rand() * 10 }))
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
        {STACK.map((item, i) => {
          const { shot } = item
          const aspect = shot.aspect ?? 16 / 10
          const next = STACK[i + 1]
          return (
            <div
              key={i}
              className="absolute left-1/2 top-1/2"
              style={{
                width: `min(${MAX_W}cqw, ${MAX_H * aspect}cqw)`,
                zIndex: i + 1,
                transform: `translate(calc(-50% + ${item.dx}cqw), calc(-50% + ${item.dy}cqw)) rotate(${item.r}deg)`,
              }}
            >
              <motion.div
                className="relative"
                style={{ aspectRatio: `${aspect}`, containerType: 'inline-size' }}
                initial={false}
                animate={on ? { opacity: 1, scale: 1, y: '0%', filter: 'blur(0px)' } : { opacity: 0, scale: reduced ? 1 : 1.3, y: reduced ? '0%' : '-8%', filter: reduced ? 'blur(0px)' : 'blur(6px)' }}
                transition={at(item.at, TIMING.fall)}
              >
                {shot.src ? (
                  <img
                    src={asset(shot.src)}
                    alt=""
                    draggable={false}
                    className="block h-full w-full rounded-[1.2cqw] object-cover shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
                  />
                ) : (
                  <Grab kind={shot.placeholder ?? 'no-events'} />
                )}
                <Annotation
                  zone={shot.empty}
                  aspect={aspect}
                  label={item.quick ? undefined : shot.label}
                  labelAt={shot.labelAt}
                  question={!item.quick && shot.question}
                  show={on}
                  instant={!playing}
                  reducedMotion={reduced}
                  delay={item.at + (item.quick ? TIMING.dupCircleAfter : TIMING.circleAfter)}
                  circleDuration={item.quick ? TIMING.dupCircleDraw : TIMING.circleDraw}
                  variant={i}
                />
                {/* dims once the next screenshot lands on top of it */}
                {next && (
                  <motion.div
                    className="pointer-events-none absolute inset-0 rounded-[1.2cqw] bg-card-to"
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

/** Which zone each placeholder leaves empty (ai-no-events and waiting draw their own states). */
const PLACEHOLDER_EMPTY: Record<Kind, keyof typeof Z | null> = {
  'no-events': 'chart',
  'events-undefined': 'kpis',
  'no-ad-sources': 'side',
  'ai-off': 'bottom',
  'ai-no-events': null,
  waiting: null,
}

/** A dummy Attribution screengrab with one area empty (or, for "waiting", everything still loading). */
function Grab({ kind }: { kind: Kind }) {
  const empty = (z: keyof typeof Z) => PLACEHOLDER_EMPTY[kind] === z
  const waiting = kind === 'waiting'
  const box = (z: Zone) => ({ left: `${z.x}%`, top: `${z.y}%`, width: `${z.w}%`, height: `${z.h}%` })
  const dashed = 'rounded-[4%] border border-dashed border-line-strong bg-surface-2'
  const sk = 'rounded-[3px] bg-skeleton'
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[1.2cqw] bg-surface shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
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

