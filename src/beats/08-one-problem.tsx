import type { Beat } from '../engine/types'
import { Reveal } from '../components/Reveal'
import { RequiredOptional } from '../components/RequiredOptional'

// Evidence tier: a card, because it holds an artifact (the Required / Optional split).
const beat: Beat = {
  slug: 'one-problem',
  title: 'One problem, not six',
  cardDense: true,
  card: (
    <div>
      {/* the payoff of the title ("Diagnosing the problem, not the symptom"): hero-size, same two-tone device */}
      <Reveal as="h2" className="m-0 text-display font-extrabold">
        One problem, <span className="text-accent">not six</span>
      </Reveal>
      <div className="text-with-aside is-mid mt-[clamp(14px,calc(var(--u)*1.6),30px)] gap-y-[0.7em] text-lead text-fg-muted text-pretty">
        <Reveal order={1} className="twa-lead">
          <p className="m-0">
            The map answered the question. The empty states weren't six problems. They were one: customers landed in Attribution before they'd had a chance to set it up. As soon as someone created an event, they saw an empty dashboard and were left to fix things on the fly.
          </p>
        </Reveal>
        <Reveal order={2} className="twa-main">
          <p className="m-0">
            The map also showed what was required and what wasn't. Event Creation and Event Definition (marking events as mid or low funnel) were the only steps needed to see anything, and Attribution only needed a single low-funnel event to work. Connecting ad sources and enabling AI added value, but they were optional.
          </p>
        </Reveal>
        <Reveal order={2} className="twa-aside">
          <RequiredOptional required={['Event Creation', 'Event Definition']} optional={['Connect ad sources', 'Enable AI']} />
        </Reveal>
        <Reveal order={3} className="twa-rest">
          <p className="m-0">
            That pointed to the fix: front-load setup before users ever see the dashboard. Required steps first, explained clearly. Optional steps last, with the choice to skip them and an easy way back later. And once setup was done, tell users their data was on its way instead of showing them an empty page.
          </p>
        </Reveal>
      </div>
    </div>
  ),
}

export default beat
