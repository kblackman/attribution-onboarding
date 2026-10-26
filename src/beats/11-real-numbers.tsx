import type { Beat } from '../engine/types'
import { Tldr } from '../components/Tldr'
import { Reveal } from '../components/Reveal'
import { DataTable } from '../components/DataTable'
import { Caption } from '../components/Caption'

// Evidence tier: a card, because it holds an artifact (the event-count ranges).
const beat: Beat = {
  slug: 'real-numbers',
  title: 'Designing for real numbers',
  cardDense: true,
  card: (
    <div>
      <Reveal as="h2" className="m-0 text-story font-extrabold">
        Designing for real numbers
      </Reveal>
      <div className="text-with-aside is-mid mt-[clamp(16px,calc(var(--u)*2.2),40px)] gap-y-[0.8em] text-lead text-fg-muted text-pretty">
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
          <figure className="m-0 flex flex-col gap-2">
            <div className="rounded-[14px] border border-hairline-strong bg-white/[0.04] px-[clamp(14px,calc(var(--u)*1.6),26px)] py-[clamp(4px,calc(var(--u)*0.6),10px)] [&_td:first-child]:whitespace-normal [&_td]:py-[clamp(12px,calc(var(--u)*1.3),22px)] [&_td]:text-[clamp(15px,calc(var(--u)*1.3),24px)]">
              <DataTable
                hideHeader
                caption="Funnel events per customer, across 124 customers"
                columns={['Measure', 'Funnel events']}
                rows={[
                  ['Median', '4 events (2 mid, 2 low)'],
                  ['Middle 80%', '1 to 12'],
                  ['10 or more', '23% of customers'],
                  ['Most', '55'],
                ]}
              />
            </div>
            <Caption>Funnel events per customer, across 124 customers.</Caption>
          </figure>
        </Reveal>
      </div>
    </div>
  ),
}

export default beat
