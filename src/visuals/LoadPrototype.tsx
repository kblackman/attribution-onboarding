import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAutoplay } from '../engine/autoplay'
import { SELF_SERVE } from '../engine/edition'
import type { VisualProps } from '../engine/types'
import { EASE_DECK } from '../engine/motion'
import { TweaksPanel } from '../components/TweaksPanel'
import { HandCircle } from '../components/HandCircle'
import { EventList, Footer, ProductFrame, SetupCard, SetupHeading, WaitingRoom, type TrackedEvent } from './onboarding-screens'

/*
  "Two moments, two patterns" visual (it was "Showing my work"): the prototype with its tweaks panel. Each key press switches the data load
  (Low, Median, High, Outlier: Kyle's Snowflake numbers for funnel events per customer, p10 1, median 4,
  p90 12, max 55) and the UI updates on the fly, in the product's real patterns (Kyle's Figma):
  Low and Median in the setup step's event list (Create an event, after the first event); High and Outlier
  in the waiting room's Events being tracked, a grid that wraps after every four. Built from the
  walkthrough's own components (onboarding-screens.tsx), in its 1440 x 900 space, scaled to the frame.
  With no key press it moves on by itself, forward only. Mock event names. Tune the timing here (seconds).
*/
export const TIMING = {
  auto: 2.2,
  // on the last load (Outlier), once its grid has scrolled: the prototype dims, the panel is circled, the note lands
  mark: 2.4,
  note: 3.1,
}

// the annotation note (Kyle, 2026-11-05; wording still being tuned)
export const NOTE = 'Swaps real customer data loads to stress-test the UI.'

export const LOADS = [
  { id: 'low', label: 'Low', count: 1, view: 'list' as const }, // p10
  { id: 'median', label: 'Median', count: 4, view: 'list' as const }, // 2 mid, 2 low
  { id: 'high', label: 'High', count: 12, view: 'grid' as const }, // p90
  { id: 'outlier', label: 'Outlier', count: 55, view: 'grid' as const }, // the max
]

// mock event names only; no customer data. Every third one is low funnel, the rest mid.
const EVENTS: TrackedEvent[] = [
  'Appointment booked', 'Form submitted', 'Call started', 'Account created', 'Pricing viewed', 'Demo requested',
  'Newsletter signup', 'Location searched', 'Provider profile viewed', 'Insurance checked', 'Callback requested',
  'Chat opened', 'Video played', 'Quiz completed', 'Review submitted', 'Referral sent', 'Portal login',
  'Refill requested', 'Waitlist joined', 'Coupon applied', 'Checkout started', 'Survey completed',
  'Directions clicked', 'Phone number clicked', 'Email signup', 'Brochure downloaded', 'Webinar registered',
  'Webinar attended', 'Free consult booked', 'Consult attended', 'Intake form started', 'Intake form completed',
  'Symptom checker used', 'Cost estimate viewed', 'Financing applied', 'Gift card purchased', 'Membership started',
  'Membership renewed', 'Class booked', 'Class attended', 'Virtual visit started', 'Prescription transferred',
  'Lab results viewed', 'Message sent', 'Reminder confirmed', 'Appointment rescheduled', 'Appointment canceled',
  'Second location viewed', 'Careers page viewed', 'Testimonial viewed',
].map((name, i) => ({ name, selector: `button.${name.toLowerCase().replace(/[^a-z]+/g, '-')}`, funnel: i % 3 === 0 ? 'low' : 'mid' }))

const W = 1440
const H = 900

export function LoadPrototype({ active, startFinished, reducedMotion: reduced, sub, requestNext }: VisualProps) {
  const autoplay = useAutoplay()
  // auto-advance forward only, and never past the last load
  useEffect(() => {
    // stepping back shows a step finished; in the portfolio edition, Play resumes from there (Back pauses, so autoplay is only on here if the reader pressed Play)
    if (!autoplay || !active || (startFinished && !SELF_SERVE) || sub >= LOADS.length - 1) return
    const t = window.setTimeout(() => requestNext(sub), TIMING.auto * 1000)
    return () => window.clearTimeout(t)
  }, [autoplay, active, startFinished, sub, requestNext])

  const load = LOADS[Math.min(sub, LOADS.length - 1)]
  // point out the tweaks panel once every load has played; stepping back into it shows it already drawn
  const marked = active && sub >= LOADS.length - 1
  const instant = startFinished
  const at = (t: number) => (instant ? { duration: 0 } : { duration: reduced ? 0.3 : 0.5, delay: reduced ? 0 : t })
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
                    <motion.div key="grid" className="relative overflow-hidden bg-fp-bg [grid-area:1/1]" {...swap}>
                      <PageScroll by={events.length} reduced={reduced}>
                        <WaitingRoom reduced={reduced} events={events} compact />
                      </PageScroll>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ProductFrame>
          </div>
          {/* dims the prototype so the annotation reads and the eye goes to the panel */}
          <motion.div className="pointer-events-none absolute inset-0 bg-[rgb(10_11_16/0.78)]" initial={false} animate={{ opacity: marked ? 1 : 0 }} transition={at(TIMING.mark - 0.3)} />
        </div>

        <div className="absolute bottom-[2cqw] left-[2cqw] z-10 max-[720px]:static max-[720px]:mt-3 max-[720px]:self-end">
          <div className="relative">
            <TweaksPanel
              label="Data load"
              options={LOADS.map(({ id, label }) => ({ id, label }))}
              value={load.id}
              readout={`${load.count} ${load.count === 1 ? 'event' : 'events'}`}
              reducedMotion={reduced}
            />
            <span className="pointer-events-none absolute -inset-x-[16%] -inset-y-[34%]">
              <HandCircle show={marked} instant={instant} reducedMotion={reduced} delay={TIMING.mark} duration={0.6} variant={1} className="inset-0 h-full w-full" />
            </span>
          </div>
          {/* the note: right of the panel with an arrow back to it; under it on phones */}
          <motion.div
            className="absolute bottom-[50%] left-[calc(100%+7cqw)] translate-y-1/2 font-[family-name:var(--font-hand)] font-bold leading-[1.15] text-annotation max-[720px]:static max-[720px]:mt-4 max-[720px]:translate-y-0"
            style={{ rotate: -2 }}
            initial={false}
            animate={{ opacity: marked ? 1 : 0 }}
            transition={at(TIMING.note)}
          >
            <p className="m-0 whitespace-nowrap text-[max(17px,2.5cqw)] max-[720px]:whitespace-normal">{NOTE}</p>
            <svg className="absolute right-[calc(100%+0.8cqw)] top-[0.2em] h-[3cqw] w-[5.5cqw] overflow-visible max-[720px]:hidden" viewBox="0 0 110 60" fill="none" stroke="var(--color-annotation)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke">
              <path d="M104,18 Q60,4 10,40" />
              <path d="M24,42 L10,40 L14,27" />
            </svg>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

/** When the page outgrows the screen (55 events), scroll it so the end of the grid shows, as a user would. */
function PageScroll({ by, reduced, children }: { by: number; reduced: boolean; children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [y, setY] = useState(0)
  useLayoutEffect(() => {
    if (outer.current && inner.current) setY(-Math.max(0, inner.current.offsetHeight + 32 - outer.current.clientHeight))
  }, [by])
  return (
    <div ref={outer} className="absolute inset-0">
      <motion.div ref={inner} initial={false} animate={{ y }} transition={{ duration: reduced ? 0 : 1.2, delay: reduced ? 0 : 0.5, ease: EASE_DECK }}>
        {children}
      </motion.div>
    </div>
  )
}
