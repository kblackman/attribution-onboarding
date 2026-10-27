import type { Beat } from '../engine/types'
import { Statement } from '../components/Statement'

// Story tier: closes 04 Solution after the walkthrough. Three goals as a numbered list (bold lead-ins, after the
// case study's numbered process steps), so Kyle can talk to the headers. 05 Impact can answer each one.
// The numerals are graphical, set large in amber (Kyle): they're the screen's yellow moment, so the text stays neutral.

/** A goal's number, large and amber. Decorative: the list carries the order. */
const Num = ({ n }: { n: number }) => (
  <span className="text-[1.9em] font-extrabold leading-[0.9] tracking-[-0.04em] text-accent tabular-nums" aria-hidden="true">
    {String(n).padStart(2, '0')}
  </span>
)
const ROW = 'grid items-start gap-x-[0.7em]'
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
        <span className={`${ROW} grid-cols-[auto_minmax(0,1fr)]`}>
          <Num n={i + 1} />
          <span className="pt-[0.15em]">{g.lead}</span>
        </span>
      ))}
      body={
        <>
          <p>This effort had three goals.</p>
          <ol className="m-0 flex list-none flex-col gap-[0.7em] p-0" role="list">
            {GOALS.map((g, i) => (
              <li key={g.lead} className={`${ROW} grid-cols-[auto_minmax(0,1fr)]`}>
                <Num n={i + 1} />
                <span className="pt-[0.2em]">
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
