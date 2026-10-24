import { useSyncExternalStore } from 'react'
import { motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'
import type { VisualProps } from '../engine/types'
import { useVisualPlayback } from '../engine/useVisualPlayback'
import { PlaceholderBadge } from '../components/Placeholder'

/*
  Beat 2 visual: three paths branching away from a simplified product shape, to Documentation, CS call,
  and Account manager. Placeholder shapes until the final illustration. Tune the timing here (seconds).
*/
export const TIMING = {
  product: 0.2, // product shape starts fading in
  productIn: 0.8,
  paths: 0.9, // first path starts drawing
  pathStagger: 0.22, // between paths
  pathDraw: 0.9, // each path's draw
  nodeLag: 0.6, // a destination appears this long after its path starts
  nodeIn: 0.7,
  reducedHold: 0.4, // reduced motion: brief hold, then one crossfade
  reducedFade: 0.6,
}
const DESTINATIONS = ['Documentation', 'CS call', 'Account manager']
const TOTAL = TIMING.paths + (DESTINATIONS.length - 1) * TIMING.pathStagger + TIMING.nodeLag + TIMING.nodeIn

// Two layouts in viewBox units: paths run right on landscape screens, down on portrait ones
const LAYOUTS = {
  wide: {
    box: [1600, 900],
    product: { x: 170, y: 280, w: 420, h: 340 },
    origin: [590, 450],
    ends: [[1130, 210], [1130, 450], [1130, 690]],
    path: (o: number[], e: number[]) => `M${o[0]},${o[1]} C${o[0] + 230},${o[1]} ${e[0] - 230},${e[1]} ${e[0]},${e[1]}`,
    clip: { x: 590, y: 0, w: 540, h: 900 },
    axis: 'x' as const,
  },
  tall: {
    box: [900, 1400],
    product: { x: 240, y: 120, w: 420, h: 340 },
    origin: [450, 460],
    ends: [[150, 1060], [450, 1060], [750, 1060]],
    path: (o: number[], e: number[]) => `M${o[0]},${o[1]} C${o[0]},${o[1] + 300} ${e[0]},${e[1] - 280} ${e[0]},${e[1]}`,
    clip: { x: 0, y: 460, w: 900, h: 600 },
    axis: 'y' as const,
  },
}

const portraitQuery = '(max-aspect-ratio: 1/1)'
function usePortrait() {
  return useSyncExternalStore(
    (cb) => { const m = matchMedia(portraitQuery); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb) },
    () => matchMedia(portraitQuery).matches,
  )
}

export function SetupPaths(props: VisualProps) {
  const { reducedMotion: reduced } = props
  const mode = useVisualPlayback(props, reduced ? TIMING.reducedHold + TIMING.reducedFade : TOTAL)
  const L = usePortrait() ? LAYOUTS.tall : LAYOUTS.wide
  const [bw, bh] = L.box
  const on = mode !== 'empty'

  // staggered when playing, instant when stepping back in or resetting, one crossfade when reduced
  const tr = (delay: number, duration: number) => {
    if (mode !== 'play') return { duration: 0 }
    if (reduced) return { duration: TIMING.reducedFade, delay: TIMING.reducedHold, ease: 'easeOut' as const }
    return { duration, delay, ease: EASE_DECK }
  }
  const drawn = on || reduced
  const p = L.product

  return (
    <div className="absolute inset-0 flex items-center justify-center px-[var(--gutter)] pb-[clamp(72px,11vh,120px)] pt-[clamp(56px,8vh,96px)]">
      <div className="absolute left-[calc(var(--gutter)+4px)] right-[calc(var(--gutter)+4px)] top-[clamp(16px,3vh,28px)]">
        <PlaceholderBadge>Placeholder shapes, final illustration to come</PlaceholderBadge>
      </div>
      <div
        className="relative"
        style={{
          aspectRatio: `${bw} / ${bh}`,
          width: `min(100%, calc((100dvh - clamp(56px,8vh,96px) - clamp(72px,11vh,120px)) * ${bw / bh}))`,
        }}
        aria-hidden="true"
      >
        <svg viewBox={`0 0 ${bw} ${bh}`} className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            {L.ends.map((_, i) => (
              <clipPath key={i} id={`setup-clip-${i}`}>
                <motion.rect
                  x={L.clip.x}
                  y={L.clip.y}
                  width={L.clip.w}
                  height={L.clip.h}
                  style={L.axis === 'x' ? { originX: 0, originY: 0.5 } : { originX: 0.5, originY: 0 }}
                  initial={false}
                  animate={L.axis === 'x' ? { scaleX: drawn ? 1 : 0 } : { scaleY: drawn ? 1 : 0 }}
                  transition={tr(TIMING.paths + i * TIMING.pathStagger, TIMING.pathDraw)}
                />
              </clipPath>
            ))}
          </defs>

          {/* paths leading away from the product */}
          {L.ends.map((e, i) => (
            <motion.g
              key={i}
              clipPath={`url(#setup-clip-${i})`}
              initial={false}
              animate={{ opacity: on ? 1 : 0 }}
              transition={tr(TIMING.paths + i * TIMING.pathStagger, 0.2)}
            >
              <path d={L.path(L.origin, e)} fill="none" stroke="var(--color-hairline-strong)" strokeWidth="3" strokeDasharray="2 12" strokeLinecap="round" />
              <circle cx={e[0]} cy={e[1]} r="7" fill="var(--color-accent)" />
            </motion.g>
          ))}

          {/* simplified product shape */}
          <motion.g
            initial={false}
            animate={{ opacity: on ? 1 : 0, scale: on || reduced ? 1 : 0.96 }}
            style={{ originX: 0.5, originY: 0.5 }}
            transition={tr(TIMING.product, TIMING.productIn)}
          >
            <rect x={p.x} y={p.y} width={p.w} height={p.h} rx="18" fill="var(--color-surface)" />
            <line x1={p.x} x2={p.x + p.w} y1={p.y + 48} y2={p.y + 48} stroke="var(--color-line)" strokeWidth="2" />
            <rect x={p.x + 24} y={p.y + 16} width="18" height="18" rx="5" fill="var(--color-product-ink)" />
            <rect x={p.x + 54} y={p.y + 20} width="110" height="10" rx="5" fill="var(--color-skeleton-strong)" />
            <rect x={p.x + 24} y={p.y + 76} width={p.w * 0.42} height="14" rx="6" fill="var(--color-skeleton-strong)" />
            <rect x={p.x + 24} y={p.y + 106} width={p.w * 0.3} height="10" rx="5" fill="var(--color-skeleton)" />
            {[0, 1, 2].map((c) => (
              <rect key={c} x={p.x + 24 + c * ((p.w - 48 - 32) / 3 + 16)} y={p.y + 140} width={(p.w - 48 - 32) / 3} height="70" rx="10" fill="var(--color-surface-2)" stroke="var(--color-line-strong)" strokeDasharray="6 6" />
            ))}
            <rect x={p.x + 24} y={p.y + 230} width={p.w - 48} height={p.h - 254} rx="10" fill="var(--color-surface-2)" stroke="var(--color-line-strong)" strokeDasharray="6 6" />
          </motion.g>
        </svg>

        {/* destinations, as HTML so labels stay crisp and sized in type tokens */}
        {L.ends.map((e, i) => (
          <motion.div
            key={DESTINATIONS[i]}
            className={`absolute rounded-xl border border-hairline-strong bg-white/[0.035] text-center font-semibold text-fg ${
              L.axis === 'x'
                ? 'px-[clamp(10px,calc(var(--u)*1.6),26px)] py-[clamp(8px,calc(var(--u)*1.2),20px)] text-lead'
                : 'px-1.5 py-2.5 text-ui'
            }`}
            style={
              L.axis === 'x'
                ? { left: `${((e[0] + 14) / bw) * 100}%`, top: `${(e[1] / bh) * 100}%`, width: '26%', translateY: '-50%' }
                : { left: `${(e[0] / bw) * 100}%`, top: `${((e[1] + 14) / bh) * 100}%`, width: '32.5%', translateX: '-50%' }
            }
            initial={false}
            animate={on ? { opacity: 1, [L.axis]: 0 } : { opacity: 0, [L.axis]: reduced ? 0 : 12 }}
            transition={tr(TIMING.paths + i * TIMING.pathStagger + TIMING.nodeLag, TIMING.nodeIn)}
          >
            {DESTINATIONS[i]}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
