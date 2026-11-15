import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'
import type { VisualProps } from '../engine/types'
import { SELF_SERVE } from '../engine/edition'
import { useAutoplay } from '../engine/autoplay'
import { BOUNDS, EDGES, EdgesView, Legend, NODES, NodeView, PATH, UNIT, firstStep, nodeById, nodeSize } from './setup-map'

/*
  Beat 7 visual: the setup ride-along. A marker starts on Attribution and travels the setup path one step
  per key press, the camera following it; with no key press it moves on by itself every AUTO seconds (only
  while going forward; after a step back it waits). Counters tick up in the corner. After the last step,
  one more press (or the auto-advance) zooms out to the whole map; the overlay then waits for a key press. The map lives in setup-map.tsx.
  Any step Kyle takes himself (arrow keys, Next, swipe) turns the auto-advance off until the visual is left, so he can take over.
  The portfolio edition skips that rule: Next just jumps ahead and autoplay carries on; Pause, P, or Back stop it.
*/
export const RIDE_STEPS = PATH.length + 1 // the 14 steps, then the zoom-out
export const TIMING = {
  auto: 2.6, // seconds per step without a key press
  camera: 1.1,
  zoomSettle: 1.4, // after the zoom-out, before the overlay
  follow: 1.35, // camera zoom while following the marker
  ping: 0.9, // after a step starts (camera moving, arrow drawing), its callout pings in
  pingHold: 1.5, // then holds this long and fades, before the next step
}

/*
  Callouts (Kyle, 2026-11-14): each time the customer leaves Attribution, and each time they have to find their own
  way back, the marker pings (a ring pulses out from it) and a small chip pops out beside it, holds, then fades.
  Nothing stays on the map. Wording is Claude's draft, awaiting Kyle.
*/
export const PINGS = { leave: 'Leaving Attribution', back: 'Navigating back manually' } // "back" was "Back to Attribution, by hand"; Kyle: everything is by hand, it's manual navigation
type PingKind = keyof typeof PINGS
const pingAt = (step: number): PingKind | null =>
  PATH[step]?.left ? 'leave' : PATH[step]?.edges?.some((id) => EDGES.find((e) => e.id === id)?.kind === 'back') ? 'back' : null

const FRAME_H = 62.5 // the 16:10 frame is 100cqw by 62.5cqw

/*
  Outside Attribution lane (Kyle, 2026-11-14, borrowed from the two-lane board that was tried and dropped):
  every page outside Attribution already sits on the row above (y -330), so a soft band shades everything above
  LANE_Y, with a dashed edge. Each time the marker climbs into it, "Times you left Attribution" ticks up.
  Manage conversions (below the row) is a drawer on the Attribution page, so it stays unshaded.
  No label (Kyle, 2026-11-15: it took too much room on the left); the band, the counter and the callouts carry it.
*/
const LANE_Y = -168 // map units: between the outside pages (bottom edge -255) and the Attribution row (top edge -81)
// small dark pills, so they stay readable when a node passes under them

export function SetupRideAlong({ active, startFinished, reducedMotion: reduced, onComplete, sub, requestNext }: VisualProps) {
  const autoplay = useAutoplay()
  const zoomed = sub >= PATH.length
  const at = Math.min(sub, PATH.length - 1)
  const prev = useRef(-1)
  // a step the auto-advance didn't take is the presenter's: stop auto-advancing until the visual is left
  const manual = useRef(false)
  const autoTo = useRef(-1)
  const forward = prev.current === sub - 1
  // only count steps taken while this visual is on screen; before that, the first active step is an arrival
  useEffect(() => {
    if (!active) manual.current = false
    else if (prev.current !== -1 && sub !== prev.current && sub !== autoTo.current) manual.current = true
    prev.current = active ? sub : -1
  }, [sub, active])

  // auto-advance, forward only; on the zoomed-out map, hand over to the overlay once it settles
  useEffect(() => {
    // stepping back shows a step finished; in the portfolio edition, Play resumes the path from there
    if (!active || (startFinished && (zoomed || !SELF_SERVE)) || (!zoomed && (!autoplay || (manual.current && !SELF_SERVE)))) return
    const t = window.setTimeout(() => {
      if (zoomed) return onComplete()
      autoTo.current = sub + 1
      requestNext(sub)
    }, (zoomed ? TIMING.zoomSettle : TIMING.auto) * 1000)
    return () => window.clearTimeout(t)
  }, [autoplay, active, startFinished, sub, zoomed, onComplete, requestNext])

  // counters: how many exits and empty states the path has passed so far
  const upTo = zoomed ? PATH.length - 1 : at
  const left = PATH.slice(0, upTo + 1).filter((s) => s.left).length
  const empty = PATH.slice(0, upTo + 1).filter((s) => s.empty).length

  // camera: follow the marker, or fit the whole map
  const focus = nodeById(PATH[at].focus)
  // zoomed out, the whole map, centered (the lane label that needed room on the left is gone, Kyle 2026-11-15)
  const fit = Math.min(94 / (BOUNDS.w * UNIT), (FRAME_H - 14) / (BOUNDS.h * UNIT))
  const scale = zoomed ? fit : TIMING.follow
  const cx = zoomed ? BOUNDS.cx : focus.x
  const zoomCy = BOUNDS.cy + 40
  const cy = zoomed ? zoomCy : focus.y
  const cam = { x: `${-cx * UNIT * scale}cqw`, y: `${-cy * UNIT * scale}cqw`, scale }
  const camTr = reduced ? { duration: 0 } : { duration: TIMING.camera, ease: EASE_DECK }

  const marker = { x: focus.x, y: focus.y - nodeSize(focus).h / 2 - 46 }

  // the step's callout, if it has one: pings in once the camera has nearly arrived, then clears
  const [ping, setPing] = useState<{ step: number; kind: PingKind } | null>(null)
  useEffect(() => {
    setPing(null)
    const kind = active && !zoomed ? pingAt(sub) : null
    if (!kind) return
    const t1 = window.setTimeout(() => setPing({ step: sub, kind }), (reduced ? 0.3 : TIMING.ping) * 1000)
    const t2 = window.setTimeout(() => setPing(null), ((reduced ? 0.3 : TIMING.ping) + TIMING.pingHold) * 1000)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [sub, active, zoomed, reduced])
  const drawNow = (step: number) => forward && step === sub

  return (
    <div className="absolute inset-0 flex items-center justify-center px-[var(--gutter)] pb-[clamp(72px,11vh,120px)] pt-[clamp(56px,8vh,96px)]">
      {/* wrapper: the map frame, plus counters (inside the frame on wide screens, below it on phones) */}
      <div
        className="relative flex flex-col"
        style={{ width: 'min(100%, calc((100dvh - clamp(56px,8vh,96px) - clamp(72px,11vh,120px)) * 1.6))', containerType: 'inline-size' }}
        aria-hidden="true"
      >
      {/* clipped at the top and bottom only: the map, and the Outside Attribution band, run the full width of the
          screen instead of stopping at the frame's sides (Kyle, 2026-11-14: the band's hard side edges) */}
      <div className="relative w-full" style={{ aspectRatio: '16 / 10', containerType: 'size', clipPath: 'inset(0 -100vw)' }}>
        {/* the map, moved by the camera; origin at the frame's center */}
        <motion.div className="absolute left-1/2 top-1/2 h-0 w-0" style={{ originX: 0, originY: 0 }} initial={false} animate={cam} transition={camTr}>
          {/* the Outside Attribution lane: shaded above the dashed edge, far wider and taller than the map, so the frame clips it */}
          <div className="absolute bg-white/[0.035]" style={{ left: '-1000cqw', width: '2000cqw', top: `${(LANE_Y - 3000) * UNIT}cqw`, height: `${3000 * UNIT}cqw` }} />
          <div className="absolute border-t border-dashed border-hairline-strong" style={{ left: '-1000cqw', width: '2000cqw', top: `${LANE_Y * UNIT}cqw` }} />
          <EdgesView
            visible={(id) => zoomed || firstStep('edges', id) <= at}
            drawNow={(id) => drawNow(firstStep('edges', id))}
            reducedMotion={reduced}
          />
          {NODES.map((n) => {
            const ns = firstStep('nodes', n.id)
            const as = firstStep('annotate', n.id)
            return (
              <NodeView
                key={n.id}
                node={n}
                shown={zoomed || ns <= at}
                annotated={as >= 0 && (zoomed || as <= at)}
                drawNow={drawNow(as)}
                reducedMotion={reduced}
              />
            )
          })}
          {/* the new customer */}
          <motion.div
            className="absolute left-0 top-0"
            initial={false}
            animate={{ x: `${marker.x * UNIT}cqw`, y: `${marker.y * UNIT}cqw`, opacity: zoomed ? 0 : 1 }}
            transition={camTr}
          >
            <div className="flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-[1.2cqw]">
              <span className="whitespace-nowrap rounded-full bg-accent px-[0.9cqw] py-[0.25cqw] text-[1.35cqw] font-bold text-card-to">New customer</span>
              <span className="relative block h-[1.6cqw] w-[1.6cqw] rounded-full bg-accent shadow-[0_0_0_0.6cqw_color-mix(in_srgb,var(--color-accent)_28%,transparent)]">
                {/* the ping: one ring pulsing out from the marker */}
                {ping && !reduced && (
                  <motion.span
                    key={`ring${ping.step}`}
                    className="absolute inset-0 rounded-full border-[0.25cqw] border-fg"
                    initial={{ scale: 1, opacity: 0.9 }}
                    animate={{ scale: 3.4, opacity: 0 }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                  />
                )}
              </span>
            </div>
            {/* the callout chip, left of the New customer tag (the counter panel sits top-right and covered it on smaller screens) */}
            <AnimatePresence>
              {ping && (
                <motion.span
                  key={`chip${ping.step}`}
                  className="absolute right-[calc(100%+6.2cqw)] top-[-2.55cqw] flex items-center gap-[0.5cqw] whitespace-nowrap rounded-full bg-fg px-[0.9cqw] py-[0.3cqw] text-[1.2cqw] font-bold text-card-to shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
                  style={{ originX: 1 }}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, x: '0.8cqw', scale: 0.85 }}
                  animate={{ opacity: 1, x: '0cqw', scale: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.35 } }}
                  transition={reduced ? { duration: 0.2 } : { duration: 0.4, ease: EASE_DECK }}
                >
                  <span aria-hidden="true">{ping.kind === 'leave' ? '↗' : '↩'}</span>
                  {PINGS[ping.kind]}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>



        <motion.div
          className="absolute bottom-[1.6cqw] left-1/2 z-10 -translate-x-1/2"
          initial={false}
          animate={{ opacity: zoomed ? 1 : 0 }}
          // in once the zoom has settled; out at once when the camera moves back in
          transition={reduced ? { duration: 0.3 } : { duration: 0.6, delay: zoomed ? TIMING.camera : 0 }}
        >
          <Legend />
        </motion.div>
      </div>
        {/* counters: a stat panel, after the case study's stat blocks */}
        <div className="absolute right-[1.6cqw] top-[1.6cqw] z-10 flex items-stretch rounded-[1.2cqw] border border-hairline-strong bg-card-to/95 shadow-[0_18px_40px_rgba(0,0,0,0.45)] max-[720px]:static max-[720px]:mt-3 max-[720px]:self-stretch">
          <Counter label="Times you left Attribution" value={left} reduced={reduced} />
          <span className="my-[1.2cqw] w-px bg-hairline-strong max-[720px]:my-3" aria-hidden="true" />
          <Counter label="Empty states hit" value={empty} reduced={reduced} />
        </div>
      </div>
    </div>
  )
}

function Counter({ label, value, reduced }: { label: string; value: number; reduced: boolean }) {
  return (
    <div className="flex min-w-[13cqw] flex-1 flex-col gap-[0.5cqw] px-[1.8cqw] py-[1.3cqw] max-[720px]:min-w-0 max-[720px]:px-4 max-[720px]:py-3">
      <span className="relative block h-[1em] overflow-hidden text-[clamp(30px,4.6cqw,68px)] font-light leading-none tabular-nums text-fg">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            className="absolute inset-0"
            initial={reduced ? { opacity: 0 } : { y: '90%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { y: '-90%', opacity: 0 }}
            transition={{ duration: reduced ? 0.2 : 0.45, ease: EASE_DECK }}
          >
            {value}
            {/* a brief accent flash when it ticks up */}
            {value > 0 && (
              <motion.span
                className="absolute inset-0 text-accent"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1.1, delay: 0.25, ease: 'easeOut' }}
                aria-hidden="true"
              >
                {value}
              </motion.span>
            )}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="text-[clamp(10px,1.05cqw,15px)] uppercase leading-[1.3] tracking-[0.14em] text-fg-soft">{label}</span>
    </div>
  )
}
