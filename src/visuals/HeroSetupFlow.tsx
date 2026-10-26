import { useLayoutEffect, useRef, useState } from 'react'
import { FlowScreen, type FlowUI } from './onboarding-screens'

/*
  The hero's pushed-back imagery: the new setup flow, frozen on Define conversion events with the event marked
  low funnel. Built from the walkthrough's own screen (onboarding-screens.tsx), so it matches 04 Solution.
  Static: the 1440 x 900 screen scaled to the width it's given.
*/
const UI: FlowUI = {
  screen: 'setup', phase: 2, drawer: false, name: '', selector: '', focus: null, events: 1, funnel: 'low', error: false,
  later: false, rule: false, ai: false, note: false, aiCollapsed: false, scroll: false, cursor: false,
}

const W = 1440
const H = 900

export function HeroSetupFlow() {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(el.clientWidth / W))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={ref} className="relative w-full overflow-hidden rounded-[12px]" style={{ aspectRatio: `${W} / ${H}` }}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ width: W, height: H, transform: `scale(${scale})` }}>
        <FlowScreen ui={UI} hover={null} reduced />
      </div>
    </div>
  )
}
