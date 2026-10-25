import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'
import type { VisualProps } from '../engine/types'
import { PlaceholderBadge } from '../components/Placeholder'
import { BOUNDS, EdgesView, Legend, NODES, NodeView, PATH, UNIT, firstStep, nodeById, nodeSize } from './setup-map'

/*
  Beat 7 visual: the setup ride-along. A marker starts on Attribution and travels the setup path one step
  per key press, the camera following it; with no key press it moves on by itself every AUTO seconds (only
  while going forward; after a step back it waits). Counters tick up in the corner. After the last step,
  one more press (or the auto-advance) zooms out to the whole map; the overlay then waits for a key press. The map lives in setup-map.tsx.
*/
export const RIDE_STEPS = PATH.length + 1 // the 14 steps, then the zoom-out
export const TIMING = {
  auto: 2, // seconds per step without a key press
  camera: 0.9,
  zoomSettle: 1.4, // after the zoom-out, before the overlay
  follow: 1.35, // camera zoom while following the marker
}

const FRAME_H = 62.5 // the 16:10 frame is 100cqw by 62.5cqw

export function SetupRideAlong({ active, startFinished, reducedMotion: reduced, onComplete, sub, requestNext }: VisualProps) {
  const zoomed = sub >= PATH.length
  const at = Math.min(sub, PATH.length - 1)
  const prev = useRef(-1)
  const forward = prev.current === sub - 1
  // only count steps taken while this visual is on screen; before that, the first active step is an arrival
  useEffect(() => {
    prev.current = active ? sub : -1
  }, [sub, active])

  // auto-advance, forward only; on the zoomed-out map, hand over to the overlay once it settles
  useEffect(() => {
    if (!active || startFinished) return
    const t = window.setTimeout(() => (zoomed ? onComplete() : requestNext(sub)), (zoomed ? TIMING.zoomSettle : TIMING.auto) * 1000)
    return () => window.clearTimeout(t)
  }, [active, startFinished, sub, zoomed, onComplete, requestNext])

  // counters: how many exits and empty states the path has passed so far
  const upTo = zoomed ? PATH.length - 1 : at
  const left = PATH.slice(0, upTo + 1).filter((s) => s.left).length
  const empty = PATH.slice(0, upTo + 1).filter((s) => s.empty).length

  // camera: follow the marker, or fit the whole map
  const focus = nodeById(PATH[at].focus)
  const fit = Math.min(94 / (BOUNDS.w * UNIT), (FRAME_H - 14) / (BOUNDS.h * UNIT))
  const scale = zoomed ? fit : TIMING.follow
  const cx = zoomed ? BOUNDS.cx : focus.x
  const cy = zoomed ? BOUNDS.cy + 40 : focus.y
  const cam = { x: `${-cx * UNIT * scale}cqw`, y: `${-cy * UNIT * scale}cqw`, scale }
  const camTr = reduced ? { duration: 0 } : { duration: TIMING.camera, ease: EASE_DECK }

  const marker = { x: focus.x, y: focus.y - nodeSize(focus).h / 2 - 46 }
  const drawNow = (step: number) => forward && step === sub

  return (
    <div className="absolute inset-0 flex items-center justify-center px-[var(--gutter)] pb-[clamp(72px,11vh,120px)] pt-[clamp(56px,8vh,96px)]">
      <div className="absolute left-[calc(var(--gutter)+4px)] right-[calc(var(--gutter)+4px)] top-[clamp(16px,3vh,28px)]">
        <PlaceholderBadge>Placeholder screens, final map to come</PlaceholderBadge>
      </div>
      {/* wrapper: the map frame, plus counters (inside the frame on wide screens, below it on phones) */}
      <div
        className="relative flex flex-col"
        style={{ width: 'min(100%, calc((100dvh - clamp(56px,8vh,96px) - clamp(72px,11vh,120px)) * 1.6))', containerType: 'inline-size' }}
        aria-hidden="true"
      >
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16 / 10', containerType: 'size' }}>
        {/* the map, moved by the camera; origin at the frame's center */}
        <motion.div className="absolute left-1/2 top-1/2 h-0 w-0" style={{ originX: 0, originY: 0 }} initial={false} animate={cam} transition={camTr}>
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
            <div className="flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-[0.5cqw]">
              <span className="whitespace-nowrap rounded-full bg-accent px-[0.9cqw] py-[0.25cqw] text-[1.35cqw] font-bold text-card-to">New customer</span>
              <span className="block h-[1.6cqw] w-[1.6cqw] rounded-full bg-accent shadow-[0_0_0_0.6cqw_color-mix(in_srgb,var(--color-accent)_28%,transparent)]" />
            </div>
          </motion.div>
        </motion.div>


        <motion.div
          className="absolute bottom-[1.6cqw] left-1/2 z-10 -translate-x-1/2"
          initial={false}
          animate={{ opacity: zoomed ? 1 : 0 }}
          transition={reduced ? { duration: 0.3 } : { duration: 0.6, delay: zoomed ? 0.6 : 0 }}
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
