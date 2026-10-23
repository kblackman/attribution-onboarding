import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { visualVariants, visualVariantsReduced } from '../engine/motion'
import type { BeatVisual, VisualProps } from '../engine/types'

export type VisualStatus = 'pre' | 'active' | 'dimmed' | 'post'

interface VisualFrameProps {
  visual: BeatVisual
  status: VisualStatus
  /** Mount the visual's content (current or next step only, so assets preload just in time). */
  mounted: boolean
  startFinished: boolean
  reducedMotion: boolean
  onComplete: () => void
  zIndex: number
  id: string
}

/** Full-screen stage for a beat's visual. Not bound by the card; takes the whole viewport. */
export function VisualFrame({ visual, status, mounted, startFinished, reducedMotion, onComplete, zIndex, id }: VisualFrameProps) {
  const Visual = visual.component
  const on = status === 'active' || status === 'dimmed'
  return (
    <motion.figure
      className="fixed inset-0 m-0 overflow-hidden bg-page"
      style={{ zIndex, pointerEvents: on ? 'auto' : 'none' }}
      aria-hidden={!on}
      inert={!on}
      aria-describedby={`${id}-desc`}
      variants={reducedMotion ? visualVariantsReduced : visualVariants}
      initial={false}
      animate={status}
    >
      {mounted && <Visual active={on} startFinished={startFinished} reducedMotion={reducedMotion} onComplete={onComplete} />}
      <figcaption id={`${id}-desc`} className="sr-only">
        {visual.description}
      </figcaption>
    </motion.figure>
  )
}

interface VideoVisualProps extends VisualProps {
  src: string
  poster: string
}

/**
 * Video for a full-screen visual: muted, inline, no controls, H.264 mp4 with a poster frame.
 * Plays while active, completes on its end, and shows the last frame when stepped back into.
 * The text description lives on the VisualFrame.
 */
export function VideoVisual({ src, poster, active, startFinished, reducedMotion, onComplete }: VideoVisualProps) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (!active) {
      v.pause()
      return
    }
    if (startFinished || reducedMotion) {
      // reduced motion: show the final frame instead of playing
      const toEnd = () => { v.currentTime = Math.max(0, v.duration - 0.05) }
      if (v.readyState >= 1) toEnd()
      else v.addEventListener('loadedmetadata', toEnd, { once: true })
      if (reducedMotion && !startFinished) onComplete()
      return
    }
    v.currentTime = 0
    void v.play().catch(() => onComplete())
  }, [active, startFinished, reducedMotion, onComplete])
  return (
    <video
      ref={ref}
      className="h-full w-full object-contain"
      src={src}
      poster={poster}
      muted
      playsInline
      preload="auto"
      onEnded={onComplete}
      aria-hidden="true"
    />
  )
}
