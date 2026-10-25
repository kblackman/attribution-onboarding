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
  one more press zooms out to the whole map, then the overlay lands. The map lives in setup-map.tsx.
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
  useEffect(() => {
    prev.current = sub
  }, [sub])

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
        {/* counters */}
        <div className="absolute right-[1.6cqw] top-[1.6cqw] z-10 flex flex-col gap-[0.6cqw] rounded-[1cqw] border border-hairline bg-card-to/90 px-[1.4cqw] py-[1cqw] text-[clamp(11px,1.3cqw,19px)] text-fg-muted max-[720px]:static max-[720px]:mt-3 max-[720px]:gap-1 max-[720px]:px-3 max-[720px]:py-2">
          <Counter label="Times you left Attribution" value={left} reduced={reduced} />
          <Counter label="Empty states hit" value={empty} reduced={reduced} />
        </div>
      </div>
    </div>
  )
}

function Counter({ label, value, reduced }: { label: string; value: number; reduced: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-[1.6cqw]">
      <span>{label}</span>
      <span className="relative inline-grid min-w-[1.2em] place-items-end overflow-hidden text-[1.35em] font-bold tabular-nums text-fg">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={reduced ? { opacity: 0 } : { y: '80%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { y: '-80%', opacity: 0 }}
            transition={{ duration: reduced ? 0.2 : 0.35, ease: EASE_DECK }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  )
}
