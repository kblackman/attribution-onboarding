import { useEffect, useRef } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'
import type { VisualProps } from '../engine/types'
import { PlaceholderBadge } from '../components/Placeholder'
import { TweaksPanel } from '../components/TweaksPanel'

/*
  Beat 12 visual: the prototype with its tweaks panel. Each key press switches the data load (Low, Average,
  High, Outlier) and the UI updates on the fly: Low and Average in the setup step's simple list; High and
  Outlier in the waiting room's grid, wrapping after every four events. With no key press it moves on by
  itself, forward only. Mock event names, placeholder UI. Tune the timing here (seconds).
*/
export const TIMING = { auto: 2.2 }

export const LOADS = [
  { id: 'low', label: 'Low', count: 1, view: 'list' as const },
  { id: 'average', label: 'Average', count: 2, view: 'list' as const },
  { id: 'high', label: 'High', count: 15, view: 'grid' as const },
  { id: 'outlier', label: 'Outlier', count: 22, view: 'grid' as const },
]

// mock event names only; no customer data
const EVENTS = [
  'Appointment booked', 'Form submitted', 'Call started', 'Account created', 'Pricing viewed', 'Demo requested',
  'Newsletter signup', 'Location searched', 'Provider profile viewed', 'Insurance checked', 'Callback requested',
  'Chat opened', 'Video played', 'Quiz completed', 'Review submitted', 'Referral sent', 'Portal login',
  'Refill requested', 'Waitlist joined', 'Coupon applied', 'Checkout started', 'Survey completed',
]

export function LoadPrototype({ active, startFinished, reducedMotion: reduced, sub, requestNext }: VisualProps) {
  const prev = useRef(-1)
  useEffect(() => {
    prev.current = active ? sub : -1
  }, [sub, active])

  // auto-advance forward only, and never past the last load
  useEffect(() => {
    if (!active || startFinished || sub >= LOADS.length - 1) return
    const t = window.setTimeout(() => requestNext(sub), TIMING.auto * 1000)
    return () => window.clearTimeout(t)
  }, [active, startFinished, sub, requestNext])

  const load = LOADS[Math.min(sub, LOADS.length - 1)]
  const events = EVENTS.slice(0, load.count)
  const layoutTr = reduced ? { duration: 0 } : { duration: 0.55, ease: EASE_DECK }
  const enter = reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }

  return (
    <div className="absolute inset-0 flex items-center justify-center px-[var(--gutter)] pb-[clamp(72px,11vh,120px)] pt-[clamp(56px,8vh,96px)]">
      <div className="absolute left-[calc(var(--gutter)+4px)] right-[calc(var(--gutter)+4px)] top-[clamp(16px,3vh,28px)]">
        <PlaceholderBadge>Placeholder UI, mock event names</PlaceholderBadge>
      </div>
      {/* wrapper: the product window, plus the tweaks panel (inside its corner on wide screens, below it on phones) */}
      <div
        className="relative flex flex-col"
        style={{ width: 'min(100%, calc((100dvh - clamp(56px,8vh,96px) - clamp(72px,11vh,120px)) * 1.6))', containerType: 'inline-size' }}
        aria-hidden="true"
      >
      <div
        className="relative w-full overflow-hidden rounded-[1.2cqw] bg-surface text-ink shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
        style={{ aspectRatio: '16 / 10', containerType: 'size' }}
      >
        <div className="flex h-[7%] items-center gap-[1.2cqw] border-b border-line px-[2cqw]">
          <span className="block h-[2cqw] w-[2cqw] rounded-[0.5cqw] bg-product-ink" />
          <span className="block h-[0.9cqw] w-[14cqw] rounded-full bg-skeleton-strong" />
        </div>

        <LayoutGroup>
          <AnimatePresence mode="wait" initial={false}>
            {load.view === 'list' ? (
              // the setup step: a simple list of the events just created
              <motion.div
                key="list"
                className="mx-auto mt-[4cqw] w-[52cqw]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0.2 : 0.35 }}
              >
                <span className="mb-[0.6cqw] block h-[1.4cqw] w-[22cqw] rounded-[0.3cqw] bg-skeleton-strong" />
                <span className="mb-[2cqw] block h-[0.8cqw] w-[34cqw] rounded-full bg-skeleton" />
                <motion.ul layout transition={layoutTr} className="m-0 flex list-none flex-col gap-[1cqw] p-0">
                  <AnimatePresence initial={false}>
                    {events.map((name) => (
                      <motion.li
                        key={name}
                        layout
                        initial={enter}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={layoutTr}
                        className="flex items-center justify-between rounded-[0.8cqw] border border-line px-[1.6cqw] py-[1.3cqw]"
                      >
                        <span className="text-[1.6cqw] font-semibold">{name}</span>
                        <span className="flex gap-[0.6cqw]">
                          <Chip>Mid funnel</Chip>
                          <Chip on>Low funnel</Chip>
                        </span>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ul>
              </motion.div>
            ) : (
              // the waiting room: every defined event, in a grid that wraps after four
              <motion.div
                key="grid"
                className="px-[3cqw] pt-[2.4cqw]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0.2 : 0.35 }}
              >
                <div className="mb-[1.8cqw] flex items-center gap-[1.4cqw]">
                  <span className="block h-[3cqw] w-[3cqw] rounded-full border-[0.3cqw] border-product-tint border-t-product" />
                  <span className="flex flex-col gap-[0.6cqw]">
                    <span className="block h-[1.3cqw] w-[24cqw] rounded-[0.3cqw] bg-skeleton-strong" />
                    <span className="block h-[0.8cqw] w-[36cqw] rounded-full bg-skeleton" />
                  </span>
                </div>
                <motion.ul layout transition={layoutTr} className="m-0 grid list-none grid-cols-4 gap-[0.9cqw] p-0">
                  <AnimatePresence initial={false}>
                    {events.map((name) => (
                      <motion.li
                        key={name}
                        layout
                        initial={enter}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={layoutTr}
                        className="flex items-center justify-between gap-[0.6cqw] rounded-[0.7cqw] border border-line px-[1cqw] py-[0.85cqw]"
                      >
                        <span className="truncate text-[1.25cqw] font-semibold">{name}</span>
                        <span className="block h-[1cqw] w-[1cqw] flex-none rounded-full bg-product" />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ul>
              </motion.div>
            )}
          </AnimatePresence>
        </LayoutGroup>
      </div>

        <TweaksPanel
          className="absolute bottom-[2cqw] right-[2cqw] z-10 max-[720px]:static max-[720px]:mt-3 max-[720px]:self-end"
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

function Chip({ children, on = false }: { children: string; on?: boolean }) {
  return (
    <span className={`rounded-full px-[1cqw] py-[0.35cqw] text-[1.1cqw] font-semibold ${on ? 'bg-product text-surface' : 'bg-product-tint text-product-ink'}`}>{children}</span>
  )
}
