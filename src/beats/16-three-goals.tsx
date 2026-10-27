import type React from 'react'
import type { Beat } from '../engine/types'
import { Statement } from '../components/Statement'

// Story tier: closes 04 Solution after the walkthrough. Three goals as a numbered list (bold lead-ins, after the
// case study's numbered process steps), so Kyle can talk to the headers. 05 Impact can answer each one.
// The numbers follow the Recommendation Cards case study's process steps (Kyle): an amber number in a page-colored
// circle with a thin amber ring, unconnected and kept compact (Kyle). They're the screen's yellow moment, so the
// text stays neutral. Sized in em, so they hold in full copy and in present mode.
const CIRCLE = 1.7 // em
const RING = 1.5 // px

/** One goal: its circled number, then its text. The number is decorative: the list carries the order. */
function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <span className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-[0.7em]">
      <span
        className="grid place-items-center rounded-full border-accent bg-page font-bold text-accent tabular-nums"
        style={{ width: `${CIRCLE}em`, height: `${CIRCLE}em`, borderWidth: RING }}
        aria-hidden="true"
      >
        <span className="text-[0.75em] leading-none">{n}</span>
      </span>
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
        <Step n={i + 1}>{g.lead}</Step>
      ))}
      body={
        <>
          <p>This effort had three goals.</p>
          <ol className="m-0 flex list-none flex-col gap-[0.9em] p-0" role="list">
            {GOALS.map((g, i) => (
              <li key={g.lead}>
                <Step n={i + 1}>
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
