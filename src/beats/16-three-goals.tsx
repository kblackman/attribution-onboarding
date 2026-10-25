import type { Beat } from '../engine/types'
import { Statement } from '../components/Statement'

// Story tier: closes 04 Solution after the walkthrough. Three goals as a numbered list (bold lead-ins, after the
// case study's numbered process steps), so Kyle can talk to the headers. 05 Impact can answer each one.
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
      body={
        <>
          <p>This effort had three goals.</p>
          <ol className="m-0 flex list-none flex-col gap-[0.7em] p-0" role="list">
            {GOALS.map((g, i) => (
              <li key={g.lead} className="grid grid-cols-[2.4ch_minmax(0,1fr)] gap-x-[0.6em]">
                <span className="tabular-nums text-fg-soft" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>
                  <b className="font-semibold text-fg">{g.lead}</b> {g.text}
                </span>
              </li>
            ))}
          </ol>
        </>
      }
    />
  ),
}

export default beat
