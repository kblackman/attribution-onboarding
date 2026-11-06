import { useContext, useLayoutEffect, useRef, useState } from 'react'
import type { Beat } from '../engine/types'
import { Tldr } from '../components/Tldr'
import { Reveal, RevealContext } from '../components/Reveal'
import { AsideGlide, TextWithAside } from '../components/TextWithAside'
import { DataTable } from '../components/DataTable'
import { Caption } from '../components/Caption'
import { HandCircle } from '../components/HandCircle'
import { usePrefersReducedMotion } from '../engine/reducedMotion'
import { LOADS, LoadPrototype } from '../visuals/LoadPrototype'

/*
  Evidence tier: a card, because it holds an artifact (the event-count ranges).
  "Two moments, two patterns" folded in (Kyle, 2026-11-05): the table carries the insight. On the next press the
  Median row and the long-tail rows get pink circles and handwritten notes (Kyle's wording), then the amber
  finisher. The playthrough follows directly, opening on the tweaks panel annotation.
*/

// the handwritten notes (Kyle, 2026-11-05)
export const CALLOUTS = {
  median: 'Half had 4 or fewer. A simple list covers it.',
  tail: 'The waiting room lists them all. A grid that wraps every 4.',
}
// seconds after the press: first circle, its note, second circle, its note (the finisher follows, Reveal order 9)
const TIMING = { median: 0, medianNote: 0.5, tail: 1.1, tailNote: 1.6 }

const ROWS = [
  ['Median', '4 events (2 mid, 2 low)'],
  ['Middle 80%', '1 to 12'],
  ['10 or more', '23% of customers'],
  ['Most', '55'],
]

const note = 'm-0 font-[family-name:var(--font-hand)] text-[clamp(17px,calc(var(--u)*1.7),30px)] font-bold leading-[1.15] text-annotation'

/** A small hand-drawn arrow, pointing down (to the table, from the note above) or up (from the note below). */
function Arrow({ up = false }: { up?: boolean }) {
  return (
    <svg className={`h-[1.4em] w-[1.4em] flex-none overflow-visible ${up ? '-scale-y-100' : ''}`} viewBox="0 0 40 40" fill="none" stroke="var(--color-annotation)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8,4 Q30,10 22,34" />
      <path d="M14,28 L22,35 L28,26" />
    </svg>
  )
}

function CalloutTable() {
  const { revealed, sub } = useContext(RevealContext)
  const reduced = usePrefersReducedMotion()
  const show = revealed && sub >= 1
  // where the circled rows sit, measured (rows wrap to different heights on phones): Median, then the last two
  const wrap = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState<{ median: [number, number]; tail: [number, number] } | null>(null)
  useLayoutEffect(() => {
    const el = wrap.current
    if (!el) return
    const measure = () => {
      const rows = [...el.querySelectorAll('tbody tr')] as HTMLElement[]
      if (rows.length < 4) return
      const span = (a: HTMLElement, b: HTMLElement): [number, number] => [a.offsetTop, b.offsetTop + b.offsetHeight - a.offsetTop]
      setBox({ median: span(rows[0], rows[0]), tail: span(rows[2], rows[3]) })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const place = (s: [number, number]) => ({ top: s[0] - s[1] * 0.12, height: s[1] * 1.24 })
  return (
    <figure className="m-0 flex flex-col gap-2">
      <Reveal step={1} order={TIMING.medianNote / 0.28} className="flex items-end gap-[0.4em] pl-[6%]">
        <p className={note} style={{ rotate: '-2deg' }}>{CALLOUTS.median}</p>
        <Arrow />
      </Reveal>
      <div className="rounded-[14px] border border-hairline-strong bg-white/[0.04] px-[clamp(14px,calc(var(--u)*1.6),26px)] py-[clamp(4px,calc(var(--u)*0.6),10px)] [&_td:first-child]:whitespace-normal [&_td]:py-[clamp(12px,calc(var(--u)*1.3),22px)] [&_td]:text-[clamp(15px,calc(var(--u)*1.3),24px)]">
        <div ref={wrap} className="relative">
          <DataTable hideHeader caption="Funnel events per customer, across 124 customers" columns={['Measure', 'Funnel events']} rows={ROWS} />
          {box && (
            <>
              <HandCircle show={show} reducedMotion={reduced} delay={TIMING.median} duration={0.6} variant={0} className="-left-[4%] w-[106%]" style={place(box.median)} />
              <HandCircle show={show} reducedMotion={reduced} delay={TIMING.tail} duration={0.7} variant={2} className="-left-[4%] w-[106%]" style={place(box.tail)} />
            </>
          )}
        </div>
      </div>
      <Caption>Funnel events per customer, across 124 customers.</Caption>
      <Reveal step={1} order={TIMING.tailNote / 0.28} className="flex items-start gap-[0.4em] pl-[6%]">
        <Arrow up />
        <p className={note} style={{ rotate: '-1.5deg' }}>{CALLOUTS.tail}</p>
      </Reveal>
    </figure>
  )
}

const beat: Beat = {
  slug: 'real-numbers',
  title: 'Designing for real numbers',
  cardDense: true,
  cardSteps: 2,
  card: (
    <div>
      <Reveal as="h2" className="m-0 text-story font-extrabold">
        Designing for <span className="text-accent">real numbers</span>
      </Reveal>
      <TextWithAside className="is-mid mt-[clamp(16px,calc(var(--u)*2.2),40px)] gap-y-[0.8em] text-lead text-fg-muted text-pretty">
        <Reveal order={1} className="twa-lead">
          <Tldr short="Once users created events, they needed a list. How long would it get?">
            <p className="m-0">
              Bringing Event Creation into the flow raised a new problem. Once users created events, they needed a list to review and define them. How long would that list get? I couldn't just design for the happy path.
            </p>
          </Tldr>
        </Reveal>
        <Reveal order={2} className="twa-main">
          <Tldr short="I asked Snowflake how many funnel events each customer had defined.">
            <p className="m-0">
              All of Freshpaint's data lived in Snowflake, which had an agent layer that let me query it in plain language. I asked how many funnel events each customer had defined, and asked for percentiles instead of an average, since an average would hide the edge cases.
            </p>
          </Tldr>
        </Reveal>
        <Reveal order={2} className="twa-aside">
          <AsideGlide>
            <CalloutTable />
          </AsideGlide>
        </Reveal>
        {/* the finisher, after both notes: this screen's one yellow line */}
        <Reveal step={1} order={9} className="twa-rest">
          <p className="m-0 text-kicker font-semibold italic text-accent">Then I put both to the test.</p>
        </Reveal>
      </TextWithAside>
    </div>
  ),
  visual: {
    component: LoadPrototype,
    steps: LOADS.length,
    description:
      'The prototype with its tweaks panel, a small floating panel with a four-option toggle: Low, Median, High, Outlier. First the prototype dims, the tweaks panel is circled in pink, and a handwritten note reads: Swaps real customer data loads to stress-test the UI. Then the note clears and the loads play. Low shows 1 event in the setup step\'s simple list; Median shows 4 events in the same list. High shows 12 events in the waiting room\'s grid, wrapping to a new row after every 4 events; Outlier shows 55 events in the same grid, and the page scrolls to show them all.',
  },
}

export default beat
