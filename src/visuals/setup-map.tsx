import { useId, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'
import { ShotView, shotByLabel, type Shot } from './EmptyStateMontage'
import { HandCircle } from '../components/HandCircle'

/*
  The Attribution setup map: every node and edge a new customer passed through before seeing their first
  recommendation. Data plus node and edge renderers, so the map can be drawn in more than one way:
  Beat 7's ride-along walks it step by step; a later 04 Solution beat can redraw the same nodes as one
  linear path. Coordinates are map units (1 unit = UNIT cqw at camera zoom 1).

  Visual language:
  - Exits from Attribution: a solid white line.
  - Manual navigation back: a dashed, hand-drawn line.
  - Empty states: the hand-drawn magenta circle (Annotation), as in the montage.
  - Waits (data ingestion, card generation): the dashed "Waiting on data" marker.
  - Hidden steps: a hand-drawn question mark.
*/
export const UNIT = 0.1 // cqw per map unit at zoom 1

export type NodeKind = 'attribution' | 'page' | 'drawer'
export interface MapNode {
  id: string
  kind: NodeKind
  x: number
  y: number
  /** Attribution screens: the screenshot and its annotation (reuses the montage's SHOTS, so real screenshots carry over). */
  shot?: Shot
  /** Pages and drawers: title shown on the node. */
  title?: string
  /** Pages and drawers: a short line under the title. */
  detail?: string
  /** Extra detail drawn on the node. */
  feature?: 'toggle' | 'oauth' | 'save' | 'funnel'
  /** Attribution screens: a "Manage conversions" button nothing points to (hidden step). */
  hiddenButton?: boolean
}
export type EdgeKind = 'exit' | 'back' | 'flow'
export interface MapEdge {
  id: string
  from: string
  to: string
  kind: EdgeKind
}

const ATTR_W = 260
const PAGE_W = 230
const DRAWER_W = 220
export const nodeSize = (n: MapNode) =>
  n.kind === 'attribution' ? { w: ATTR_W, h: (ATTR_W * 10) / 16 } : n.kind === 'page' ? { w: PAGE_W, h: 150 } : { w: DRAWER_W, h: 132 }

const shot = (label: string, patch: Partial<Shot> = {}): Shot => ({ ...shotByLabel(label), ...patch })

export const NODES: MapNode[] = [
  { id: 'attr-1', kind: 'attribution', x: 0, y: 0, shot: shot('No events') }, // No events
  { id: 'events', kind: 'page', x: 360, y: -330, title: 'Events', detail: 'Leave Attribution' },
  { id: 'event-creation', kind: 'drawer', x: 700, y: -330, title: 'Event Creation', detail: 'Create an event, save', feature: 'save' },
  { id: 'attr-2', kind: 'attribution', x: 1040, y: 0, shot: shot('Events not defined'), hiddenButton: true }, // Events not defined
  { id: 'event-definition', kind: 'drawer', x: 1040, y: 330, title: 'Manage conversions', detail: 'Mark events as mid or low funnel', feature: 'funnel' },
  { id: 'attr-3', kind: 'attribution', x: 1400, y: 0, shot: shot('Waiting on data', { label: 'Data ingestion', labelAt: { x: 70, y: 8 } }) }, // wait
  { id: 'attr-4', kind: 'attribution', x: 1760, y: 0, shot: shot('No ad sources') }, // No ad sources
  { id: 'sources', kind: 'page', x: 2100, y: -330, title: 'Sources', detail: 'Connect ad sources', feature: 'oauth' },
  { id: 'attr-5', kind: 'attribution', x: 2440, y: 0, shot: shot('AI off') }, // AI off
  { id: 'ai-settings', kind: 'page', x: 2780, y: -330, title: 'Freshpaint AI settings', detail: 'Turn on AI', feature: 'toggle' },
  {
    id: 'attr-6',
    kind: 'attribution',
    x: 3120,
    y: 0,
    shot: shot('Recommendations processing', { label: 'Card generation', question: true }),
  }, // wait: cards take a full day
]

export const EDGES: MapEdge[] = [
  { id: 'e1', from: 'attr-1', to: 'events', kind: 'exit' },
  { id: 'e2', from: 'events', to: 'event-creation', kind: 'flow' },
  { id: 'e3', from: 'event-creation', to: 'attr-2', kind: 'back' },
  { id: 'e4', from: 'attr-2', to: 'event-definition', kind: 'flow' },
  { id: 'e5', from: 'event-definition', to: 'attr-3', kind: 'flow' },
  { id: 'e6', from: 'attr-3', to: 'attr-4', kind: 'flow' },
  { id: 'e7', from: 'attr-4', to: 'sources', kind: 'exit' },
  { id: 'e8', from: 'sources', to: 'attr-5', kind: 'back' },
  { id: 'e9', from: 'attr-5', to: 'ai-settings', kind: 'exit' },
  { id: 'e10', from: 'ai-settings', to: 'attr-6', kind: 'back' },
]

/**
 * The path, one entry per step (Kyle's 14). `focus` is where the marker and camera go; nodes, edges, and
 * annotations listed here appear on this step; `left` and `empty` add to the counters.
 */
export interface PathStep {
  focus: string
  nodes?: string[]
  edges?: string[]
  annotate?: string[]
  left?: boolean
  empty?: boolean
}
export const PATH: PathStep[] = [
  { focus: 'attr-1', nodes: ['attr-1'], annotate: ['attr-1'], empty: true }, // 1 Attribution, nothing set up: no events
  { focus: 'events', nodes: ['events'], edges: ['e1'], left: true }, // 2 Exit 1: leave for Events
  { focus: 'event-creation', nodes: ['event-creation'], edges: ['e2'] }, // 3 Event Creation drawer, save
  { focus: 'attr-2', nodes: ['attr-2'], edges: ['e3'] }, // 4 back to Attribution by hand
  { focus: 'attr-2', annotate: ['attr-2'], empty: true }, // 5 events not defined; hidden Manage conversions
  { focus: 'event-definition', nodes: ['event-definition'], edges: ['e4'] }, // 6 drawer slides up; mid or low funnel
  { focus: 'attr-3', nodes: ['attr-3'], edges: ['e5'], annotate: ['attr-3'], empty: true }, // 7 wait: data ingestion
  { focus: 'attr-4', nodes: ['attr-4'], edges: ['e6'], annotate: ['attr-4'], empty: true }, // 8 spend empty: no ad sources
  { focus: 'sources', nodes: ['sources'], edges: ['e7'], left: true }, // 9 Exit 2: Sources, OAuth
  { focus: 'attr-5', nodes: ['attr-5'], edges: ['e8'] }, // 10 back by hand
  { focus: 'attr-5', annotate: ['attr-5'], empty: true }, // 11 Recommendation Cards: AI off
  { focus: 'ai-settings', nodes: ['ai-settings'], edges: ['e9'], left: true }, // 12 Exit 3: AI settings, toggle on
  { focus: 'attr-6', nodes: ['attr-6'], edges: ['e10'] }, // 13 back by hand
  { focus: 'attr-6', annotate: ['attr-6'], empty: true }, // 14 wait: cards take a full day
]

/** The step (0-based) at which a node, edge, or annotation first appears. */
export function firstStep(kind: 'nodes' | 'edges' | 'annotate', id: string) {
  return PATH.findIndex((s) => s[kind]?.includes(id))
}

export const BOUNDS = (() => {
  const xs = NODES.flatMap((n) => [n.x - nodeSize(n).w / 2, n.x + nodeSize(n).w / 2])
  const ys = NODES.flatMap((n) => [n.y - nodeSize(n).h / 2, n.y + nodeSize(n).h / 2])
  const minX = Math.min(...xs) - 60
  const maxX = Math.max(...xs) + 60
  const minY = Math.min(...ys) - 90
  const maxY = Math.max(...ys) + 60
  return { minX, minY, w: maxX - minX, h: maxY - minY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 }
})()

export const nodeById = (id: string) => NODES.find((n) => n.id === id)!

// ---------- renderers ----------

interface NodeViewProps {
  node: MapNode
  shown: boolean
  annotated: boolean
  /** Animate the annotation drawing (only on the step it first appears). */
  drawNow: boolean
  reducedMotion: boolean
}

/** A node placed on the map canvas, in map units. */
export function NodeView({ node, shown, annotated, drawNow, reducedMotion }: NodeViewProps) {
  const { w, h } = nodeSize(node)
  const drawer = node.kind === 'drawer'
  return (
    <motion.div
      className="absolute"
      style={{ left: `${(node.x - w / 2) * UNIT}cqw`, top: `${(node.y - h / 2) * UNIT}cqw`, width: `${w * UNIT}cqw` }}
      initial={false}
      animate={shown ? { opacity: 1, scale: 1, y: '0%' } : { opacity: 0, scale: reducedMotion ? 1 : 0.92, y: drawer && !reducedMotion ? '30%' : '0%' }}
      transition={reducedMotion ? { duration: 0.3 } : { duration: 0.6, ease: EASE_DECK }}
    >
      {node.kind === 'attribution' && node.shot ? (
        <div className="relative">
          <ShotView shot={node.shot} show={annotated} instant={!drawNow} reducedMotion={reducedMotion} circleDuration={0.6} />
          {node.hiddenButton && <HiddenButton show={annotated} instant={!drawNow} reducedMotion={reducedMotion} />}
        </div>
      ) : (
        <PageNode node={node} reducedMotion={reducedMotion} on={shown} />
      )}
    </motion.div>
  )
}

/**
 * Pages and drawers outside Attribution: the same shell as the Attribution screenshots (radius, header
 * bar, shadow), so every node on the map reads as one family. Title, one line of detail, one feature.
 */
function PageNode({ node, on, reducedMotion }: { node: MapNode; on: boolean; reducedMotion: boolean }) {
  return (
    <div
      className="relative overflow-hidden rounded-[1.2cqw] bg-surface text-ink shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
      style={{ containerType: 'inline-size', aspectRatio: node.kind === 'drawer' ? `${DRAWER_W} / 132` : `${PAGE_W} / 150` }}
    >
      <div className="flex h-[15%] items-center gap-[3%] border-b border-line px-[5%]">
        <span className="block aspect-square h-[46%] rounded-[20%] bg-product-ink" />
        <span className="block h-[26%] w-[24%] rounded-full bg-skeleton-strong" />
      </div>
      <div className="px-[6%] pt-[6%]">
        <div className="text-[9cqw] font-bold leading-[1.1] tracking-[-0.01em]">{node.title}</div>
        {node.detail && <div className="mt-[2%] text-[6.4cqw] leading-[1.25] text-ink-2">{node.detail}</div>}
        <div className="mt-[6%] flex items-center gap-[4%]">
          {node.feature === 'toggle' && <Toggle on={on} reducedMotion={reducedMotion} />}
          {node.feature === 'save' && <span className="rounded-full bg-product px-[6%] py-[2%] text-[6cqw] font-semibold text-surface">Save</span>}
          {node.feature === 'oauth' && <span className="rounded-full border border-line-strong px-[6%] py-[2%] text-[6cqw] font-semibold text-ink-2">Authorize</span>}
          {node.feature === 'funnel' && (
            <>
              <span className="rounded-full bg-product-tint px-[5%] py-[2%] text-[5.6cqw] font-semibold text-product-ink">Mid funnel</span>
              <span className="rounded-full bg-product-tint px-[5%] py-[2%] text-[5.6cqw] font-semibold text-product-ink">Low funnel</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Toggle({ on, reducedMotion }: { on: boolean; reducedMotion: boolean }) {
  return (
    <span className={`relative block h-[9cqw] w-[16cqw] rounded-full transition-colors duration-500 ${on ? 'bg-product' : 'bg-skeleton-strong'}`}>
      <motion.span
        className="absolute top-[12%] block h-[76%] w-[42%] rounded-full bg-surface shadow"
        initial={false}
        animate={{ x: on ? '125%' : '12%' }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.5, ease: EASE_DECK }}
      />
    </span>
  )
}

/** A "Manage conversions" button in the screen's header that nothing points to, marked with a hand-drawn ?. */
function HiddenButton({ show, instant, reducedMotion }: { show: boolean; instant: boolean; reducedMotion: boolean }) {
  return (
    <div className="pointer-events-none absolute right-[4%] top-[2.2%] h-[7%] w-[22%]" style={{ containerType: 'inline-size' }}>
      <span className="block h-full w-full rounded-full border border-line-strong bg-surface" />
      <HandCircle show={show} instant={instant} reducedMotion={reducedMotion} delay={0.9} duration={0.45} variant={2} className="-inset-[35%] h-[170%] w-[170%]" />
      <motion.span
        className="absolute left-[102%] top-[-60%] font-[family-name:var(--font-hand)] text-[70cqw] font-bold leading-none text-annotation"
        initial={false}
        animate={show ? { opacity: 1, scale: 1, rotate: 10 } : { opacity: 0, scale: reducedMotion ? 1 : 0.5, rotate: 10 }}
        transition={instant ? { duration: 0 } : { duration: 0.4, delay: 1.3 }}
      >
        ?
      </motion.span>
    </div>
  )
}

/** All edges in one SVG over the canvas, in map units. Each draws outward from its start when it appears. */
export function EdgesView({ visible, drawNow, reducedMotion }: { visible: (id: string) => boolean; drawNow: (id: string) => boolean; reducedMotion: boolean }) {
  const b = BOUNDS
  return (
    <svg
      className="absolute overflow-visible"
      style={{ left: `${b.minX * UNIT}cqw`, top: `${b.minY * UNIT}cqw`, width: `${b.w * UNIT}cqw`, height: `${b.h * UNIT}cqw` }}
      viewBox={`${b.minX} ${b.minY} ${b.w} ${b.h}`}
    >
      {EDGES.map((e) => (
        <Edge key={e.id} edge={e} shown={visible(e.id)} drawNow={drawNow(e.id)} reducedMotion={reducedMotion} />
      ))}
    </svg>
  )
}

function Edge({ edge, shown, drawNow, reducedMotion }: { edge: MapEdge; shown: boolean; drawNow: boolean; reducedMotion: boolean }) {
  const id = useId().replace(/:/g, '')
  const a = nodeById(edge.from)
  const z = nodeById(edge.to)
  const edgePoint = (n: MapNode, toward: MapNode, pad: number) => {
    const { w, h } = nodeSize(n)
    const dx = toward.x - n.x
    const dy = toward.y - n.y
    const t = Math.min((w / 2 + pad) / Math.abs(dx || 1e-6), (h / 2 + pad) / Math.abs(dy || 1e-6))
    return { x: n.x + dx * t, y: n.y + dy * t }
  }
  const s = edgePoint(a, z, 16)
  const e = edgePoint(z, a, 22)
  const len = Math.hypot(e.x - s.x, e.y - s.y)
  // a slight bend; back paths bend the other way and wobble a little, as if drawn by hand
  const bend = edge.kind === 'back' ? -0.16 : 0.08
  const nx = -(e.y - s.y) / len
  const ny = (e.x - s.x) / len
  const c1 = { x: s.x + (e.x - s.x) * 0.33 + nx * len * bend, y: s.y + (e.y - s.y) * 0.33 + ny * len * bend }
  const c2 = { x: s.x + (e.x - s.x) * 0.7 + nx * len * bend * (edge.kind === 'back' ? 0.6 : 1), y: s.y + (e.y - s.y) * 0.7 + ny * len * bend * (edge.kind === 'back' ? 0.6 : 1) }
  const ang = Math.atan2(e.y - c2.y, e.x - c2.x)
  const head = 18
  const h1 = `${e.x - head * Math.cos(ang - 0.5)},${e.y - head * Math.sin(ang - 0.5)}`
  const h2 = `${e.x - head * Math.cos(ang + 0.5)},${e.y - head * Math.sin(ang + 0.5)}`
  const stroke = edge.kind === 'exit' ? 'var(--color-fg)' : edge.kind === 'back' ? 'var(--color-fg-muted)' : 'var(--color-fg-soft)'
  const width = edge.kind === 'exit' ? 3 : 2.2
  return (
    <g>
      <defs>
        <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x={BOUNDS.minX - 200} y={BOUNDS.minY - 200} width={BOUNDS.w + 400} height={BOUNDS.h + 400}>
          <motion.circle
            cx={s.x}
            cy={s.y}
            r={len * 1.15}
            fill="#fff"
            style={{ originX: 0.5, originY: 0.5 }}
            initial={false}
            animate={{ scale: shown ? 1 : reducedMotion ? 1 : 0, opacity: shown ? 1 : 0 }}
            transition={!drawNow ? { duration: 0 } : reducedMotion ? { duration: 0.3 } : { duration: 0.7, delay: 0.1, ease: EASE_DECK }}
          />
        </mask>
      </defs>
      <g mask={`url(#${id}-m)`} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
        <path d={`M${s.x},${s.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${e.x},${e.y}`} strokeDasharray={edge.kind === 'back' ? '10 10' : undefined} vectorEffect="non-scaling-stroke" />
        <path d={`M${h1} L${e.x},${e.y} L${h2}`} vectorEffect="non-scaling-stroke" />
      </g>
    </g>
  )
}

/** The legend, for the zoomed-out view: what each line and mark means. */
export function Legend({ className = '' }: { className?: string }) {
  const Row = ({ children, label }: { children: ReactNode; label: string }) => (
    <span className="flex items-center gap-[0.8em]">
      {children}
      <span>{label}</span>
    </span>
  )
  return (
    <div className={`flex flex-wrap items-center gap-x-[1.6em] gap-y-[0.6em] text-[clamp(11px,1.15cqw,16px)] text-fg-muted ${className}`}>
      <Row label="Left Attribution">
        <span className="block h-[3px] w-[2.2em] rounded-full bg-fg" />
      </Row>
      <Row label="Back by hand">
        <span className="block w-[2.2em] border-t-2 border-dashed border-fg-muted" />
      </Row>
      <Row label="Empty state">
        <span className="block h-[1.1em] w-[1.6em] rounded-[50%] border-2 border-annotation" />
      </Row>
      <Row label="Waiting">
        <span className="block h-[1.1em] w-[1.6em] rounded-[50%] border-2 border-dashed border-annotation" />
      </Row>
    </div>
  )
}
