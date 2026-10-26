import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { VisualProps } from '../engine/types'
import { PlaceholderBadge } from '../components/Placeholder'
import { TweaksPanel } from '../components/TweaksPanel'
import { EventList, Footer, ProductFrame, SetupCard, SetupHeading, WaitingRoom, type TrackedEvent } from './onboarding-screens'

/*
  "Showing my work" visual: the prototype with its tweaks panel. Each key press switches the data load
  (Low, Average, High, Outlier) and the UI updates on the fly, in the product's real patterns (Kyle's Figma):
  Low and Average in the setup step's event list (Create an event, after the first event); High and Outlier
  in the waiting room's Events being tracked, a grid that wraps after every four. Built from the
  walkthrough's own components (onboarding-screens.tsx), in its 1440 x 900 space, scaled to the frame.
  With no key press it moves on by itself, forward only. Mock event names. Tune the timing here (seconds).
*/
export const TIMING = { auto: 2.2 }

export const LOADS = [
  { id: 'low', label: 'Low', count: 1, view: 'list' as const },
  { id: 'average', label: 'Average', count: 2, view: 'list' as const },
  { id: 'high', label: 'High', count: 15, view: 'grid' as const },
  { id: 'outlier', label: 'Outlier', count: 22, view: 'grid' as const },
]

// mock event names only; no customer data. Every third one is low funnel, the rest mid.
const EVENTS: TrackedEvent[] = [
  'Appointment booked', 'Form submitted', 'Call started', 'Account created', 'Pricing viewed', 'Demo requested',
  'Newsletter signup', 'Location searched', 'Provider profile viewed', 'Insurance checked', 'Callback requested',
  'Chat opened', 'Video played', 'Quiz completed', 'Review submitted', 'Referral sent', 'Portal login',
  'Refill requested', 'Waitlist joined', 'Coupon applied', 'Checkout started', 'Survey completed',
].map((name, i) => ({ name, selector: `button.${name.toLowerCase().replace(/[^a-z]+/g, '-')}`, funnel: i % 3 === 0 ? 'low' : 'mid' }))

const W = 1440
const H = 900

export function LoadPrototype({ active, startFinished, reducedMotion: reduced, sub, requestNext }: VisualProps) {
  // auto-advance forward only, and never past the last load
  useEffect(() => {
    if (!active || startFinished || sub >= LOADS.length - 1) return
    const t = window.setTimeout(() => requestNext(sub), TIMING.auto * 1000)
    return () => window.clearTimeout(t)
  }, [active, startFinished, sub, requestNext])

  const load = LOADS[Math.min(sub, LOADS.length - 1)]
  const events = EVENTS.slice(0, load.count)

  // scale the 1440 x 900 screen to the frame
  const frameRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  useLayoutEffect(() => {
    const el = frameRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(el.clientWidth / W))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const swap = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: reduced ? 0.15 : 0.3 } }

  return (
    <div className="absolute inset-0 flex items-center justify-center px-[var(--gutter)] pb-[clamp(72px,11vh,120px)] pt-[clamp(56px,8vh,96px)]">
      <div className="absolute left-[calc(var(--gutter)+4px)] right-[calc(var(--gutter)+4px)] top-[clamp(16px,3vh,28px)]">
        <PlaceholderBadge>Rebuilt from the Figma designs, mock event names</PlaceholderBadge>
      </div>
      {/* wrapper: the product window, plus the tweaks panel (bottom-left, over the lower sidebar, on wide screens; below it on phones) */}
      <div
        className="relative flex flex-col"
        style={{ width: 'min(100%, calc((100dvh - clamp(56px,8vh,96px) - clamp(72px,11vh,120px)) * 1.6))', containerType: 'inline-size' }}
        aria-hidden="true"
      >
        <div ref={frameRef} className="relative w-full overflow-hidden rounded-[1.2cqw] shadow-[0_24px_60px_rgba(0,0,0,0.45)]" style={{ aspectRatio: `${W} / ${H}` }}>
          <div className="absolute left-0 top-0 origin-top-left" style={{ width: W, height: H, transform: `scale(${scale})` }}>
            <ProductFrame>
              <div className="grid h-full">
                <AnimatePresence initial={false}>
                  {load.view === 'list' ? (
                    // the setup step after the first event: the event list, then Add another
                    <motion.div key="list" className="relative bg-fp-bg [grid-area:1/1]" {...swap}>
                      <div className="mx-auto w-[700px] pt-[65px]">
                        <SetupHeading phase={1} reduced={reduced} />
                        <SetupCard n={1} title="Create an event" body="Add at least one event you want to track. You can add more than one, but one is enough to continue.">
                          <EventList events={events} hover={null} reduced={reduced} />
                        </SetupCard>
                        <Footer hover={null} back={false} />
                      </div>
                    </motion.div>
                  ) : (
                    // the waiting room: every defined event, four across
                    <motion.div key="grid" className="relative bg-fp-bg [grid-area:1/1]" {...swap}>
                      <WaitingRoom reduced={reduced} events={events} compact />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ProductFrame>
          </div>
        </div>

        <TweaksPanel
          className="absolute bottom-[2cqw] left-[2cqw] z-10 max-[720px]:static max-[720px]:mt-3 max-[720px]:self-end"
          label="Data load"
          options={LOADS.map(({ id, label }) => ({ id, label }))}
          value={load.id}
          readout={`${load.count} ${load.count === 1 ? 'event' : 'events'}`}
          reducedMotion={reduced}
        />
      </div>
    </div>
  )
}
