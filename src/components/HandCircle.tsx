import { useId } from 'react'
import { motion } from 'motion/react'

/*
  A crude hand-drawn circle in the annotation color, the kind you'd scribble on a screenshot to say "look here".
  Used to mark empty areas (Beat 3's session grid, Beat 4's empty-state montage).

  It "draws" clockwise from 12 o'clock with transforms only: two half-plane masks rotate
  around the center (pie-timer style) to sweep the stroke into view. No dash animation.
  Size and place it with className; the stroke stretches to fit and keeps its weight.
*/

// Loose ellipses in a 200 x 120 box. Each starts near 12 o'clock and overshoots its start, like a real pen loop.
const SHAPES = [
  'M92,8 C148,2 194,20 193,58 C192,96 146,114 96,113 C44,112 6,94 8,58 C10,24 50,8 104,7 C124,7 140,10 152,15',
  'M108,10 C160,9 196,30 192,64 C188,100 140,116 92,112 C42,108 4,88 9,54 C14,22 58,6 100,9 C118,10 132,13 142,19',
  'M86,12 C140,0 198,16 196,56 C194,98 150,118 100,114 C52,110 2,96 6,60 C10,26 46,10 98,8 C116,8 130,12 140,18',
]

interface HandCircleProps {
  /** Drawn (true) or hidden (false). */
  show: boolean
  /** Seconds before the stroke starts. */
  delay?: number
  /** Seconds for one full loop. */
  duration?: number
  /** Skip the animation and appear or disappear at once (stepping back in). */
  instant?: boolean
  reducedMotion?: boolean
  /** Which of the hand-drawn shapes to use, so repeated circles don't look stamped. */
  variant?: number
  /** A dashed stroke, to mark one circle as different from the rest (e.g. an open question). */
  dashed?: boolean
  className?: string
}

export function HandCircle({ show, delay = 0, duration = 0.8, instant = false, reducedMotion = false, variant = 0, dashed = false, className = '' }: HandCircleProps) {
  const id = useId().replace(/:/g, '')
  const d = SHAPES[variant % SHAPES.length]

  // reduced motion: a plain fade, no sweep
  if (reducedMotion) {
    return (
      <motion.svg
        viewBox="0 0 200 120"
        preserveAspectRatio="none"
        className={`pointer-events-none absolute overflow-visible ${className}`}
        initial={false}
        animate={{ opacity: show ? 1 : 0 }}
        transition={{ duration: instant ? 0 : 0.3, delay: show && !instant ? delay : 0 }}
        aria-hidden="true"
      >
        <Stroke d={d} dashed={dashed} />
      </motion.svg>
    )
  }

  const half = instant ? 0 : duration / 2
  const sweep = { originX: 0.5, originY: 0.5 }
  return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="none" className={`pointer-events-none absolute overflow-visible ${className}`} aria-hidden="true">
      <defs>
        <clipPath id={`${id}-r`}>
          <rect x="100" y="-200" width="400" height="600" />
        </clipPath>
        <clipPath id={`${id}-l`}>
          <rect x="-300" y="-200" width="400" height="600" />
        </clipPath>
        <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x="-300" y="-200" width="800" height="600">
          {/* right half: 12 o'clock round to 6 */}
          <g clipPath={`url(#${id}-r)`}>
            <motion.g
              style={sweep}
              initial={false}
              animate={{ rotate: show ? 180 : 0 }}
              transition={{ duration: show ? half : 0, delay: show && !instant ? delay : 0, ease: 'easeIn' }}
            >
              <HalfDisc />
            </motion.g>
          </g>
          {/* left half: 6 round to 12 */}
          <g clipPath={`url(#${id}-l)`}>
            <motion.g
              style={sweep}
              initial={false}
              animate={{ rotate: show ? 0 : -180 }}
              transition={{ duration: show ? half : 0, delay: show && !instant ? delay + half : 0, ease: 'easeOut' }}
            >
              <HalfDisc />
            </motion.g>
          </g>
        </mask>
      </defs>
      <g mask={`url(#${id}-m)`}>
        <Stroke d={d} dashed={dashed} />
      </g>
    </svg>
  )
}

/** White left half, black right half, centered on the circle so it rotates about (100, 60). */
const HalfDisc = () => (
  <>
    <rect x="-100" y="-140" width="200" height="400" fill="#fff" />
    <rect x="100" y="-140" width="200" height="400" fill="#000" />
  </>
)

const Stroke = ({ d, dashed }: { d: string; dashed?: boolean }) => (
  <path d={d} fill="none" stroke="var(--color-annotation)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashed ? '7 8' : undefined} vectorEffect="non-scaling-stroke" />
)
