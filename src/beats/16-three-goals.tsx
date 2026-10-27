import type React from 'react'
import type { Beat } from '../engine/types'
import { Statement } from '../components/Statement'

// Story tier: closes 04 Solution after the walkthrough. Three goals as a numbered list (bold lead-ins, after the
// case study's numbered process steps), so Kyle can talk to the headers. 05 Impact can answer each one.
// The numbers follow the Recommendation Cards case study's process steps (Kyle): an amber number in a page-colored
// circle with a thin amber ring, the circles joined by an amber line. They're the screen's yellow moment, so the
// text stays neutral. Sized in em, so they hold in full copy and in present mode.
const CIRCLE = 2.2 // em
const RING = 2 // px, the ring and the joining line

/**
 * One goal: its circled number, then its text. Every step but the last draws the line down to the next circle,
 * across the list's gap (`gap`, in em). The number is decorative: the list carries the order.
 */
function Step({ n, last, gap, children }: { n: number; last: boolean; gap: number; children: React.ReactNode }) {
  return (
    <span className="relative grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-[0.8em]">
      <span
        className="relative z-[1] grid place-items-center rounded-full border-accent bg-page font-bold text-accent tabular-nums"
        style={{ width: `${CIRCLE}em`, height: `${CIRCLE}em`, borderWidth: RING }}
        aria-hidden="true"
      >
        <span className="text-[0.95em] leading-none">{n}</span>
      </span>
      {!last && (
        <span
          className="absolute bg-accent"
          style={{ left: `calc(${CIRCLE / 2}em - ${RING / 2}px)`, width: RING, top: `${CIRCLE}em`, height: `calc(100% - ${CIRCLE}em + ${gap}em)` }}
          aria-hidden="true"
        />
      )}
      {/* the first line of text sits level with the circle's center */}
      <span style={{ paddingTop: `calc((${CIRCLE}em - 1lh) / 2)` }}>{children}</span>
    </span>
  )
}

const GOALS: { lead: string; text: string }[] = [
  {
    lead: 'Own onboarding.',
    text: `Nobody did. One of Freshpaint's values is "Be the CEO": act first, ask permission later. I saw a gap that was hurting adoption and moved to solve it instead of asking permission. Design took ownership of onboarding.`,
  },
  { lead: 'Set users up for success.', text: 'Many customers were struggling to get Attribution set up.' },
  { lead: 'Build something reusable.', text: 'Our design system had no wizard or flow pattern. Now it had a solid foundation for one.' },
]

const beat: Beat = {
  slug: 'three-goals',
  title: 'Three goals, one solution',
  variant: 'statement',
  cardDense: true,
  card: (
    <Statement
      wide
      headline="Three goals, one solution"
      // present mode (T): draft, awaiting Kyle's approval
      tldrBullets={false}
      tldr={GOALS.map((g, i) => (
        // 0.6em: the gap between present-mode lines in Statement
        <Step n={i + 1} last={i === GOALS.length - 1} gap={0.6}>
          {g.lead}
        </Step>
      ))}
      body={
        <>
          <p>This effort had three goals.</p>
          <ol className="m-0 flex list-none flex-col gap-[0.9em] p-0" role="list">
            {GOALS.map((g, i) => (
              <li key={g.lead}>
                <Step n={i + 1} last={i === GOALS.length - 1} gap={0.9}>
                  <b className="font-semibold text-fg">{g.lead}</b> {g.text}
                </Step>
              </li>
            ))}
          </ol>
        </>
      }
    />
  ),
}

export default beat
