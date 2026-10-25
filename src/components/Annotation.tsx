import { useId } from 'react'
import { motion } from 'motion/react'
import { HandCircle } from './HandCircle'

/** An area of an image, in percent of the image's width (x, w) and height (y, h). */
export interface Zone {
  x: number
  y: number
  w: number
  h: number
}

interface AnnotationProps {
  /** The area to circle, in percent of the image, so it stays put at any image size. */
  zone: Zone
  /** The image's width / height. Keeps the arrow and circle geometry true for any screenshot. */
  aspect: number
  /** Short handwritten note. Omit for a circle alone. */
  label?: string
  /** Where the label sits, in percent of the image. Defaults to beside the circle, above or below it. */
  labelAt?: { x: number; y: number }
  /** Mark it as different from the rest: dashed circle plus a question mark. */
  question?: boolean
  show: boolean
  /** Skip animation (stepping back in). */
  instant?: boolean
  reducedMotion?: boolean
  /** Seconds before the circle starts; the label and arrow follow it. */
  delay?: number
  circleDuration?: number
  variant?: number
}

const PAD = 5 // the circle sits this far (percent) outside the zone
const MAGENTA = 'var(--color-annotation)'

/**
 * Kyle's markup on a screenshot: a hand-drawn circle around an area, a handwritten label beside it, and a
 * hand-drawn arrow from the label to the circle's edge. Annotation color only. Place it inside a
 * relatively positioned box that is exactly the image (same aspect), with container-type: inline-size.
 */
export function Annotation({ zone, aspect, label, labelAt, question, show, instant = false, reducedMotion = false, delay = 0, circleDuration = 0.6, variant = 0 }: AnnotationProps) {
  const id = useId().replace(/:/g, '')
  const H = 100 / aspect // viewBox height, so 1 unit is the same length on both axes

  // circle box (viewBox units)
  const bx = zone.x - PAD
  const by = ((zone.y - PAD) * H) / 100
  const bw = zone.w + PAD * 2
  const bh = ((zone.h + PAD * 2) * H) / 100
  const cx = bx + bw / 2
  const cy = by + bh / 2

  // label anchor: given, or beside the circle (above if there's room, else below), nudged toward the middle
  const gap = (12 * H) / 100
  const above = labelAt ? (labelAt.y * H) / 100 < cy : zone.y > 26
  const lx = labelAt ? labelAt.x : Math.min(84, Math.max(16, cx + (cx < 50 ? 24 : -24)))
  const lyRaw = labelAt ? (labelAt.y * H) / 100 : above ? by - gap : by + bh + gap
  const ly = Math.min(H * 0.95, Math.max(H * 0.06, lyRaw))

  // arrow: from just under/over the label to the circle's edge, with a slight hand-drawn bend
  const sx = lx
  const sy = ly + (above ? 1.4 : -1.4)
  const theta = Math.atan2((sy - cy) / (bh / 2), (sx - cx) / (bw / 2))
  let ex = cx + (bw / 2) * Math.cos(theta)
  let ey = cy + (bh / 2) * Math.sin(theta)
  const len = Math.hypot(sx - ex, sy - ey) || 1
  ex += ((sx - ex) / len) * 1.6
  ey += ((sy - ey) / len) * 1.6
  const mx = (sx + ex) / 2
  const my = (sy + ey) / 2
  const nx = -(ey - sy) / len
  const ny = (ex - sx) / len
  const qx = mx + nx * len * 0.22
  const qy = my + ny * len * 0.22
  const tAng = Math.atan2(ey - qy, ex - qx)
  const head = 3.2
  const h1 = `${ex - head * Math.cos(tAng - 0.5)},${ey - head * Math.sin(tAng - 0.5)}`
  const h2 = `${ex - head * Math.cos(tAng + 0.5)},${ey - head * Math.sin(tAng + 0.5)}`

  const labelDelay = delay + circleDuration * 0.85
  const arrowDelay = labelDelay + 0.15
  const tr = (d: number, dur: number) => (instant ? { duration: 0 } : { duration: reducedMotion ? 0.3 : dur, delay: show ? d : 0 })

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute" style={{ left: `${bx}%`, top: `${zone.y - PAD}%`, width: `${bw}%`, height: `${zone.h + PAD * 2}%` }}>
        <HandCircle show={show} instant={instant} reducedMotion={reducedMotion} delay={delay} duration={circleDuration} variant={variant} dashed={question} className="inset-0 h-full w-full" />
        {question && (
          <motion.span
            className="absolute inset-0 grid place-items-center font-[family-name:var(--font-hand)] text-[14cqw] font-bold leading-none text-annotation"
            initial={false}
            animate={show ? { opacity: 1, scale: 1, rotate: 8 } : { opacity: 0, scale: reducedMotion ? 1 : 0.6, rotate: 8 }}
            transition={tr(delay + circleDuration * 0.6, 0.45)}
          >
            ?
          </motion.span>
        )}
      </div>

      {label && (
        <>
          <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
            <defs>
              <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x="-50" y={-H} width="200" height={H * 3}>
                <rect x="-50" y={-H} width="200" height={H * 3} fill="#000" />
                {/* the arrow draws outward from the label: a growing reveal, transform only */}
                <motion.circle
                  cx={sx}
                  cy={sy}
                  r={len * 1.25}
                  fill="#fff"
                  style={{ originX: 0.5, originY: 0.5 }}
                  initial={false}
                  animate={{ scale: show ? 1 : reducedMotion ? 1 : 0, opacity: show ? 1 : 0 }}
                  transition={tr(arrowDelay, 0.5)}
                />
              </mask>
            </defs>
            <g mask={`url(#${id}-m)`} fill="none" stroke={MAGENTA} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d={`M${sx},${sy} Q${qx},${qy} ${ex},${ey}`} vectorEffect="non-scaling-stroke" />
              <path d={`M${h1} L${ex},${ey} L${h2}`} vectorEffect="non-scaling-stroke" />
            </g>
          </svg>
          <motion.span
            className="absolute whitespace-nowrap font-[family-name:var(--font-hand)] text-[clamp(16px,5.2cqw,60px)] font-bold leading-none text-annotation"
            style={{ left: `${lx}%`, top: `${(ly / H) * 100}%`, x: '-50%', y: above ? '-100%' : '0%', rotate: -4 }}
            initial={false}
            animate={{ opacity: show ? 1 : 0 }}
            transition={tr(labelDelay, 0.4)}
          >
            {label}
          </motion.span>
        </>
      )}
    </div>
  )
}
