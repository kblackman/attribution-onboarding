import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { VisualProps } from '../engine/types'
import { useVisualPlayback } from '../engine/useVisualPlayback'
import { PlaceholderBadge } from '../components/Placeholder'
import { Dashboard, DashboardResolveContext, ProductFrame, type DashboardResolve } from './onboarding-screens'

/*
  05 Impact, "The result": the Attribution dashboard from 04 Solution's walkthrough (rebuilt from Kyle's Figma,
  same state the walkthrough ends on), resolving section by section. Each section starts as a loading card:
  the setup banner, the AI recommendations bar, the filters, then Source performance with its bars growing.
  The page then scrolls down as the ad sources banner and the source table resolve.
  Tune the timing here (seconds).
*/
export const TIMING = {
  start: 1.8, // hold on the loading page (the frame is still arriving for the first second or so)
  stagger: 0.45, // between the sections at the top
  scrollAfter: 1.1, // after the chart starts resolving, before the page scrolls
  scroll: 3.2,
  lowerAt: [0.9, 1.5], // ad sources banner, source table: seconds into the scroll
  hold: 1.2,
  reducedHold: 1.0, // reduced motion: hold, then one crossfade, no scroll
}

const SCROLL_AT = TIMING.start + 3 * TIMING.stagger + TIMING.scrollAfter
export const TOTAL = SCROLL_AT + TIMING.scroll + TIMING.hold
const at = (order: number) => (order < 4 ? TIMING.start + order * TIMING.stagger : SCROLL_AT + TIMING.lowerAt[order - 4])

const W = 1440
const H = 900

export function AttributionResolve(props: VisualProps) {
  const { reducedMotion: reduced } = props
  const mode = useVisualPlayback(props, reduced ? TIMING.reducedHold + 0.4 : TOTAL)

  const frameRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  useLayoutEffect(() => {
    const el = frameRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(el.clientWidth / W))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const resolve = useMemo<DashboardResolve>(() => ({ mode, reduced, at: reduced ? () => TIMING.reducedHold : at }), [mode, reduced])

  return (
    <div className="absolute inset-0 flex items-center justify-center px-[var(--gutter)] pb-[clamp(72px,11vh,120px)] pt-[clamp(56px,8vh,96px)]">
      <div className="absolute left-[calc(var(--gutter)+4px)] right-[calc(var(--gutter)+4px)] top-[clamp(16px,3vh,28px)]">
        <PlaceholderBadge>Rebuilt from the Figma designs, mock data</PlaceholderBadge>
      </div>
      <div
        ref={frameRef}
        className="relative overflow-hidden rounded-[12px] shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
        style={{ width: 'min(100%, calc((100dvh - clamp(56px,8vh,96px) - clamp(72px,11vh,120px)) * 1.6))', aspectRatio: `${W} / ${H}` }}
        aria-hidden="true"
      >
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: W, height: H, transform: `scale(${scale})` }}>
          <DashboardResolveContext.Provider value={resolve}>
            <ProductFrame>
              {/* the walkthrough's end state: AI recommendations hidden. Stepping back in lands scrolled, with no motion. */}
              <Dashboard
                scroll={mode !== 'empty'}
                aiCollapsed
                hover={null}
                reduced={reduced}
                scrollSeconds={mode === 'play' ? TIMING.scroll : 0}
                scrollDelay={mode === 'play' ? SCROLL_AT : 0}
              />
            </ProductFrame>
          </DashboardResolveContext.Provider>
        </div>
      </div>
    </div>
  )
}
