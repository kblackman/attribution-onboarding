import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'
import type { VisualProps } from '../engine/types'
import { useVisualPlayback } from '../engine/useVisualPlayback'
import { HandCircle } from '../components/HandCircle'
import { Annotation, type Zone } from '../components/Annotation'
import { SHOTS, type Shot } from './EmptyStateMontage'

/*
  Beat 3 visual: a 2x2 video-call grid that builds one tile at a time. Each tile is a research session
  with a customer sharing the same half-set-up Attribution dashboard; a hand-drawn circle marks its
  empty area as the tile lands. After the fourth, that tile zooms to fill the frame and holds.
  Participants are generated webcam stills (no real people), pixelated so they read as real faces kept private
  (Kyle, 2026-11-14; they were vector avatars). Each tile's first thumbnail is that session's customer, the second
  the same stand-in for Kyle in all four. No names or data. Each tile can show one of the montage's recreated screenshots (shot), fitted
  into the shared screen at its own proportions, circled on its empty area; tiles without one still draw the
  placeholder. Per Kyle's copy the sessions showed No ad sources and AI off.
  Each circle is labeled "Empty state" with an arrow (Kyle, 2026-11-06), so it's clear why they're circled. The type
  of empty state isn't named here; the montage in the next section does that.
  Tune the timing here (seconds).
*/
export const TIMING = {
  start: 0.5, // first tile
  tileStagger: 1.5, // between tiles
  tileIn: 0.7,
  circleDelay: 0.6, // circle starts this long after its tile
  circleDraw: 0.8,
  zoomAfter: 1.0, // hold on the full grid after the last circle, then zoom
  zoom: 1.4,
  reducedHold: 0.3, // reduced motion: all tiles and circles fade in together, no zoom
  reducedFade: 0.6,
}
const shot = (label: string) => SHOTS.find((s) => s.label === label && s.src)
// four different half-set-up dashboards (Kyle: vary them): two missing ad sources, two without Recommendation Cards.
// Waiting states (processing, not enough data) stay out: a later beat reveals those weren't setup problems.
// The last tile zooms to fill the frame.
const SESSIONS: { day: string; purpose: string; shot?: Shot; face: string }[] = [
  { day: 'Day 1', purpose: 'Customer 1', shot: shot('Requires API connection'), face: 'customer-1.jpg' },
  { day: 'Day 1', purpose: 'Customer 2', shot: shot('AI off'), face: 'customer-2.jpg' },
  { day: 'Day 2', purpose: 'Customer 3', shot: shot('AI on, no events'), face: 'customer-3.jpg' },
  { day: 'Day 2', purpose: 'Customer 4', shot: shot('No ad sources'), face: 'customer-4.jpg' },
]
// the note on every circle (Kyle, 2026-11-06)
export const NOTE = 'Empty state'
const tileAt = (i: number) => TIMING.start + i * TIMING.tileStagger
const ZOOM_AT = tileAt(SESSIONS.length - 1) + TIMING.circleDelay + TIMING.circleDraw + TIMING.zoomAfter
const TOTAL = ZOOM_AT + TIMING.zoom

// tiles are 49% of the frame with a 2% gutter, so the bottom-right tile fills the frame at 100 / 49
const TILE = 49
const ZOOM = 100 / TILE

export function SessionGrid(props: VisualProps) {
  const { reducedMotion: reduced } = props
  const mode = useVisualPlayback(props, reduced ? TIMING.reducedHold + TIMING.reducedFade : TOTAL)
  const on = mode !== 'empty'
  const instant = mode !== 'play'
  const zoomed = on && !reduced

  const tileTr = (i: number) =>
    instant ? { duration: 0 } : reduced ? { duration: TIMING.reducedFade, delay: TIMING.reducedHold } : { duration: TIMING.tileIn, delay: tileAt(i), ease: EASE_DECK }
  const zoomTr = instant ? { duration: 0 } : { duration: TIMING.zoom, delay: ZOOM_AT, ease: EASE_DECK }

  /*
    One state change drives the whole sequence, so each tile carries its own timeline. The last tile lands
    and stays; the others land, hold, then fade as the zoom starts.
  */
  const tileMotion = (i: number, last: boolean) => {
    if (!on) return { animate: { opacity: 0, scale: reduced ? 1 : 0.96 }, transition: { duration: 0 } }
    if (instant) return { animate: { opacity: last || !zoomed ? 1 : 0, scale: 1 }, transition: { duration: 0 } }
    if (reduced || last) return { animate: { opacity: 1, scale: 1 }, transition: tileTr(i) }
    const start = tileAt(i)
    const span = ZOOM_AT + TIMING.zoom * 0.6 - start
    return {
      animate: { opacity: [0, 1, 1, 0], scale: [0.96, 1, 1, 1] },
      transition: { duration: span, delay: start, times: [0, TIMING.tileIn / span, (ZOOM_AT - start) / span, 1], ease: EASE_DECK },
    }
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center px-[var(--gutter)] pb-[clamp(72px,11vh,120px)] pt-[clamp(56px,8vh,96px)]">
      <div
        className="relative overflow-hidden rounded-[14px]"
        style={{ aspectRatio: '16 / 10', width: 'min(100%, calc((100dvh - clamp(56px,8vh,96px) - clamp(72px,11vh,120px)) * 1.6))' }}
        aria-hidden="true"
      >
        <motion.div
          className="absolute inset-0"
          style={{ originX: 1, originY: 1 }}
          initial={false}
          animate={{ scale: zoomed ? ZOOM : 1 }}
          transition={zoomTr}
        >
          {SESSIONS.map((s, i) => {
            const last = i === SESSIONS.length - 1
            return (
              <motion.div
                key={i}
                className="absolute"
                style={{ left: `${(i % 2) * (100 - TILE)}%`, top: `${Math.floor(i / 2) * (100 - TILE)}%`, width: `${TILE}%`, height: `${TILE}%` }}
                initial={false}
                {...tileMotion(i, last)}
              >
                <Tile
                  {...s}
                  annotate={(zone, aspect) => (
                    <Annotation
                      zone={zone}
                      aspect={aspect}
                      label={NOTE}
                      show={on}
                      instant={instant}
                      reducedMotion={reduced}
                      delay={reduced ? TIMING.reducedHold : tileAt(i) + TIMING.circleDelay}
                      circleDuration={TIMING.circleDraw}
                      variant={i}
                    />
                  )}
                  circle={(className, style) => (
                    <HandCircle
                      show={on}
                      instant={instant}
                      reducedMotion={reduced}
                      delay={reduced ? TIMING.reducedHold : tileAt(i) + TIMING.circleDelay}
                      duration={TIMING.circleDraw}
                      variant={i}
                      className={className}
                      style={style}
                    />
                  )}
                />
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}

/** One call tile: session stamp, the shared screen, and two generic participant thumbnails. */
function Tile({ day, purpose, shot, face, annotate, circle }: { day: string; purpose: string; shot?: Shot; face: string; annotate: (zone: Zone, aspect: number) => ReactNode; circle: (className: string, style?: CSSProperties) => ReactNode }) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[12px] border border-hairline bg-card-to" style={{ containerType: 'size' }}>
      {/* in flow, so on small tiles the labels push the screen down instead of covering it */}
      <div className="flex flex-none flex-wrap items-center gap-x-[1.6cqw] gap-y-1 px-[3cqw] pb-[2.2cqw] pt-[2.6cqw] text-[clamp(9px,2.3cqw,16px)] leading-none">
        <span className="rounded-full border border-hairline-strong px-[0.7em] py-[0.35em] font-semibold uppercase tracking-[0.12em] text-fg-muted">{day}</span>
        <span className="text-fg-soft">{purpose}</span>
      </div>

      <div className="relative min-h-0 flex-1">
      {/* shared screen */}
      {shot?.src ? (
        <div className="absolute bottom-[3cqw] left-[3cqw] right-[22cqw] top-0 grid place-items-center" style={{ containerType: 'size' }}>
          {/* the screenshot at its own proportions, as large as the screen area allows */}
          <div className="relative" style={{ width: `min(100cqw, ${100 * (shot.aspect ?? 1.6)}cqh)`, aspectRatio: String(shot.aspect ?? 1.6), containerType: 'inline-size' }}>
            <img src={`${import.meta.env.BASE_URL}assets/hunch/${shot.src}`} alt="" draggable={false} className="block h-full w-full rounded-[1.2cqw] object-cover" />
            {/* the circle, the "Empty state" note and its arrow */}
            {annotate(shot.empty, shot.aspect ?? 1.6)}
          </div>
        </div>
      ) : (
        <div className="absolute bottom-[3cqw] left-[3cqw] right-[22cqw] top-0 rounded-[1.2cqw] bg-surface">
          <HalfSetUpDashboard />
          {circle('left-[51%] top-[36%] h-[68%] w-[52%]')}
        </div>
      )}

      {/* participants: the customer, then Kyle's stand-in, pixelated */}
      <div className="absolute right-[3cqw] top-0 flex w-[16cqw] flex-col gap-[2cqw]">
        {[face, 'designer.jpg'].map((src) => (
          <Pixelated key={src} src={`${import.meta.env.BASE_URL}assets/pattern/${src}`} className="aspect-[4/3] w-full overflow-hidden rounded-[1cqw] bg-white/[0.06]" />
        ))}
      </div>
      </div>
    </div>
  )
}

// how coarse the mosaic is: blocks across a thumbnail (fewer hides more; more reads more like video)
const PIXEL_CELLS = 10

/** A photo drawn as a coarse mosaic: shrunk onto a tiny canvas (averaging each block), then scaled up without smoothing. */
function Pixelated({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      const c = ref.current
      if (!c) return
      c.width = PIXEL_CELLS
      c.height = Math.round((PIXEL_CELLS * img.naturalHeight) / img.naturalWidth)
      c.getContext('2d')?.drawImage(img, 0, 0, c.width, c.height)
    }
    img.src = src
  }, [src])
  return <canvas ref={ref} className={`block ${className ?? ''}`} style={{ imageRendering: 'pixelated' }} aria-hidden="true" />
}

/** The same half-set-up page in every session: some data in, spend and recommendations empty. */
function HalfSetUpDashboard() {
  const empty = 'rounded-[3%] border border-dashed border-line-strong bg-surface-2'
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden rounded-[inherit]">
      <div className="flex h-[12%] flex-none items-center gap-[2%] border-b border-line px-[3%]">
        <span className="block aspect-square h-[46%] rounded-[20%] bg-product-ink" />
        <span className="block h-[26%] w-[18%] rounded-full bg-skeleton-strong" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-[4%] p-[3%]">
        <div className="grid h-[24%] flex-none grid-cols-4 gap-[3%]">
          {[0, 1].map((k) => (
            <div key={k} className="flex flex-col justify-end gap-[12%] rounded-[6%] border border-line p-[8%]">
              <span className="block h-[22%] w-[70%] rounded-[2px] bg-product-ink" />
              <span className="block h-[14%] w-[45%] rounded-full bg-product-tint" />
            </div>
          ))}
          {[2, 3].map((k) => (
            <div key={k} className={empty} />
          ))}
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[1.2fr_1fr] gap-[3%]">
          <div className="relative overflow-hidden rounded-[3%] border border-line">
            <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[70%] w-full">
              <path d="M0,40 C15,36 25,42 40,32 S65,24 80,18 S95,12 100,10 L100,50 L0,50 Z" fill="var(--color-product-mint)" opacity="0.4" />
              <path d="M0,40 C15,36 25,42 40,32 S65,24 80,18 S95,12 100,10" fill="none" stroke="var(--color-product)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <div className={empty} />
        </div>
      </div>
    </div>
  )
}
