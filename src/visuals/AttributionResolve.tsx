import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'
import type { VisualProps } from '../engine/types'
import { PlaceholderBadge } from '../components/Placeholder'

/*
  Beat 1 visual: an Attribution page of empty-state widgets that resolves into a populated, healthy page.
  Built from placeholder shapes (no real numbers or labels) until the real screens arrive.
  Tune the timing here. All values are seconds.
*/
export const TIMING = {
  start: 0.9, // hold on the empty page before anything resolves
  kpiStagger: 0.35, // between each KPI widget
  blockStagger: 0.6, // between the larger widgets that follow the KPIs
  resolve: 0.8, // empty to populated crossfade, per widget
  data: 0.9, // charts drawing, bars growing, rows landing inside a widget
  reducedHold: 1.2, // reduced motion: hold empty, then one crossfade
  reducedFade: 0.6,
}

const KPI_COUNT = 4
// order of resolution: KPIs, then line chart, bar chart, table
const delayFor = (order: number) =>
  order < KPI_COUNT
    ? TIMING.start + order * TIMING.kpiStagger
    : TIMING.start + (KPI_COUNT - 1) * TIMING.kpiStagger + (order - KPI_COUNT + 1) * TIMING.blockStagger
const LAST_ORDER = KPI_COUNT + 2
export const TOTAL = delayFor(LAST_ORDER) + TIMING.resolve + TIMING.data * 0.6

type Mode = 'empty' | 'play' | 'done'

export function AttributionResolve({ active, startFinished, reducedMotion, onComplete }: VisualProps) {
  const [mode, setMode] = useState<Mode>(startFinished ? 'done' : 'empty')
  const completed = useRef(false)

  useEffect(() => {
    if (!active) {
      // reset after the frame has faded out, so a replay starts from empty
      const t = window.setTimeout(() => { setMode('empty'); completed.current = false }, 800)
      return () => window.clearTimeout(t)
    }
    if (startFinished) {
      setMode('done')
      completed.current = true
      return
    }
    if (completed.current) return
    setMode('play')
    const total = reducedMotion ? TIMING.reducedHold + TIMING.reducedFade : TOTAL
    const t = window.setTimeout(() => { completed.current = true; onComplete() }, total * 1000)
    return () => window.clearTimeout(t)
  }, [active, startFinished, reducedMotion, onComplete])

  const ctx: ResolveCtx = { mode, reduced: reducedMotion }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-[var(--gutter)] pb-[clamp(72px,11vh,120px)] pt-[clamp(56px,8vh,96px)]">
      <div className="absolute left-[calc(var(--gutter)+4px)] right-[calc(var(--gutter)+4px)] top-[clamp(16px,3vh,28px)]">
        <PlaceholderBadge>Placeholder widgets, real Attribution screens to come</PlaceholderBadge>
      </div>
      <Screen>
        <div className="flex h-full flex-col">
          <TopBar ctx={ctx} />
          <div className="flex min-h-0 flex-1">
            <SideNav />
            <div className="grid min-h-0 flex-1 grid-cols-3 grid-rows-[9cqw_18cqw_1fr] gap-[1.5cqw] p-[2cqw]">
              <div className="col-span-3 grid grid-cols-4 gap-[1.5cqw]">
                {Array.from({ length: KPI_COUNT }, (_, i) => (
                  <Widget key={i} order={i} ctx={ctx} titleWidth={[42, 55, 38, 48][i]}>
                    <Kpi ctx={ctx} order={i} />
                  </Widget>
                ))}
              </div>
              <Widget order={KPI_COUNT} ctx={ctx} titleWidth={30} className="col-span-2">
                <LineChart ctx={ctx} order={KPI_COUNT} />
              </Widget>
              <Widget order={KPI_COUNT + 1} ctx={ctx} titleWidth={50}>
                <Bars ctx={ctx} order={KPI_COUNT + 1} />
              </Widget>
              <Widget order={KPI_COUNT + 2} ctx={ctx} titleWidth={22} className="col-span-3">
                <Rows ctx={ctx} order={KPI_COUNT + 2} />
              </Widget>
            </div>
          </div>
        </div>
      </Screen>
    </div>
  )
}

interface ResolveCtx {
  mode: Mode
  reduced: boolean
}

/** Transition for one widget: staggered when playing, instant when stepping back in, one crossfade when reduced. */
function tr(ctx: ResolveCtx, order: number, extra = 0, duration = TIMING.resolve) {
  if (ctx.mode === 'done') return { duration: 0 }
  if (ctx.mode === 'empty') return { duration: 0 }
  if (ctx.reduced) return { duration: TIMING.reducedFade, delay: TIMING.reducedHold, ease: 'easeOut' as const }
  return { duration, delay: delayFor(order) + extra, ease: EASE_DECK }
}
const isFilled = (ctx: ResolveCtx) => ctx.mode !== 'empty'

/** The product screen at its final 16:10 ratio, sized to fit, with container units for everything inside. */
function Screen({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative overflow-hidden rounded-[clamp(8px,1.2cqw,16px)] bg-surface text-ink shadow-[0_24px_60px_rgba(0,0,0,0.45),0_2px_8px_rgba(0,0,0,0.2)]"
      style={{
        width: 'min(100%, calc((100dvh - clamp(56px,8vh,96px) - clamp(72px,11vh,120px)) * 1.6))',
        aspectRatio: '16 / 10',
        containerType: 'size',
      }}
      aria-hidden="true"
    >
      {children}
    </div>
  )
}

const Sk = ({ w, h = 0.9, className = '' }: { w: number | string; h?: number; className?: string }) => (
  <span className={`block rounded-[0.3cqw] bg-skeleton ${className}`} style={{ width: typeof w === 'number' ? `${w}%` : w, height: `${h}cqw` }} />
)

function TopBar({ ctx }: { ctx: ResolveCtx }) {
  return (
    <div className="flex h-[4.5cqw] flex-none items-center gap-[1.2cqw] border-b border-line px-[2cqw]">
      <span className="block h-[2cqw] w-[2cqw] rounded-[0.5cqw] bg-ink" />
      <span className="text-[1.35cqw] font-bold tracking-[-0.01em]">Attribution</span>
      <div className="ml-auto flex items-center gap-[1cqw]">
        {/* page health dot: neutral while empty, positive once populated */}
        <span className="relative block h-[0.8cqw] w-[0.8cqw]">
          <span className="absolute inset-0 rounded-full bg-skeleton" />
          <motion.span
            className="absolute inset-0 rounded-full bg-positive"
            initial={false}
            animate={{ opacity: isFilled(ctx) ? 1 : 0 }}
            transition={tr(ctx, LAST_ORDER, TIMING.resolve)}
          />
        </span>
        <Sk w="10cqw" h={2.2} className="rounded-full" />
        <span className="block h-[2.4cqw] w-[2.4cqw] rounded-full bg-skeleton" />
      </div>
    </div>
  )
}

function SideNav() {
  return (
    <div className="flex w-[14cqw] flex-none flex-col gap-[1.3cqw] border-r border-line bg-surface-2 px-[1.6cqw] py-[2cqw]">
      {[70, 55, 80, 60, 50, 65].map((w, i) => (
        <Sk key={i} w={w} h={0.8} className={i === 2 ? 'bg-[color-mix(in_srgb,var(--color-accent)_45%,var(--color-skeleton))]' : ''} />
      ))}
    </div>
  )
}

interface WidgetProps {
  order: number
  ctx: ResolveCtx
  titleWidth: number
  className?: string
  children: ReactNode
}

/** Widget shell stays put; its body crossfades from an empty state to data. */
function Widget({ order, ctx, titleWidth, className = '', children }: WidgetProps) {
  const filled = isFilled(ctx)
  return (
    <div className={`flex min-h-0 flex-col gap-[1cqw] rounded-[0.8cqw] border border-line bg-surface p-[1.2cqw] ${className}`}>
      <Sk w={titleWidth} h={0.75} className="flex-none bg-skeleton-strong" />
      <div className="relative min-h-0 flex-1">
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center gap-[0.6cqw] rounded-[0.5cqw] border border-dashed border-line-strong bg-surface-2"
          initial={false}
          animate={filled ? { opacity: 0, scale: ctx.reduced ? 1 : 0.98 } : { opacity: 1, scale: 1 }}
          transition={tr(ctx, order)}
        >
          <span className="block h-[1.6cqw] w-[1.6cqw] rounded-full border-[0.18cqw] border-glyph" />
          <Sk w="24%" h={0.6} className="max-w-[8cqw]" />
        </motion.div>
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={filled ? { opacity: 1, y: 0 } : { opacity: 0, y: ctx.reduced ? 0 : '0.6cqw' }}
          transition={tr(ctx, order)}
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}

function Kpi({ ctx, order }: { ctx: ResolveCtx; order: number }) {
  const filled = isFilled(ctx)
  return (
    <div className="flex h-full flex-col justify-end gap-[0.7cqw]">
      <motion.span
        className="block h-[2.2cqw] origin-left rounded-[0.4cqw] bg-ink"
        style={{ width: `${[64, 52, 72, 58][order]}%` }}
        initial={false}
        animate={{ scaleX: filled || ctx.reduced ? 1 : 0 }}
        transition={tr(ctx, order, 0.15, TIMING.data)}
      />
      <span className="flex items-center gap-[0.5cqw]">
        <span className="block h-[1.3cqw] w-[4cqw] rounded-full bg-positive-tint" />
        <Sk w="30%" h={0.6} />
      </span>
    </div>
  )
}

// line chart path in a 300 x 100 box, rising overall
const LINE = 'M0,78 C20,74 32,80 50,70 S80,58 100,62 S130,50 150,48 S185,40 200,34 S235,30 250,22 S285,14 300,10'

function LineChart({ ctx, order }: { ctx: ResolveCtx; order: number }) {
  const filled = isFilled(ctx)
  return (
    <div className="relative h-full overflow-hidden">
      <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {[25, 50, 75].map((y) => (
          <line key={y} x1="0" x2="300" y1={y} y2={y} stroke="var(--color-line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        <path d={`${LINE} L300,100 L0,100 Z`} fill="var(--color-accent)" opacity="0.14" />
        <path d={LINE} fill="none" stroke="var(--color-accent-deep)" strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* draws the line left to right: a surface-colored cover slides away (transform only) */}
      <motion.div
        className="absolute inset-y-0 left-0 w-full bg-surface"
        initial={false}
        animate={{ x: filled || ctx.reduced ? '101%' : '0%' }}
        transition={tr(ctx, order, 0.2, TIMING.data * 1.4)}
      />
    </div>
  )
}

const BARS = [38, 52, 46, 64, 58, 76, 88]

function Bars({ ctx, order }: { ctx: ResolveCtx; order: number }) {
  const filled = isFilled(ctx)
  return (
    <div className="flex h-full items-end gap-[0.6cqw] border-b border-line">
      {BARS.map((h, i) => (
        <motion.span
          key={i}
          className="block flex-1 origin-bottom rounded-t-[0.3cqw]"
          style={{ height: `${h}%`, background: i === BARS.length - 1 ? 'var(--color-accent-deep)' : 'color-mix(in srgb, var(--color-accent) 55%, var(--color-surface))' }}
          initial={false}
          animate={{ scaleY: filled || ctx.reduced ? 1 : 0 }}
          transition={tr(ctx, order, 0.12 + i * 0.05, TIMING.data)}
        />
      ))}
    </div>
  )
}

function Rows({ ctx, order }: { ctx: ResolveCtx; order: number }) {
  const filled = isFilled(ctx)
  return (
    <div className="flex h-full flex-col justify-between">
      {[0, 1, 2, 3].map((r) => (
        <motion.div
          key={r}
          className="grid grid-cols-[1.4fr_1fr_1fr_1.6fr] items-center gap-[2cqw] border-b border-line pb-[0.7cqw] last:border-0"
          initial={false}
          animate={filled ? { opacity: 1, x: 0 } : { opacity: 0, x: ctx.reduced ? 0 : '-0.8cqw' }}
          transition={tr(ctx, order, 0.1 + r * 0.08, TIMING.data)}
        >
          <span className="flex items-center gap-[0.6cqw]">
            <span className="block h-[1.4cqw] w-[1.4cqw] flex-none rounded-[0.3cqw] bg-skeleton" />
            <Sk w={[70, 55, 62, 48][r]} h={0.7} />
          </span>
          <Sk w={[60, 45, 52, 40][r]} h={0.7} />
          <Sk w={[50, 58, 40, 46][r]} h={0.7} />
          <span className="block h-[0.8cqw] overflow-hidden rounded-full bg-surface-2">
            <span className="block h-full rounded-full bg-accent-deep" style={{ width: `${[86, 72, 64, 51][r]}%` }} />
          </span>
        </motion.div>
      ))}
    </div>
  )
}
