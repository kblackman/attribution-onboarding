import type { Beat } from '../engine/types'
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
          <p className="m-0">
            Bringing Event Creation into the flow raised a new problem. Once users created events, they needed a list to review and define them. How long would that list get? I couldn't just design for the happy path.
          </p>
        </Reveal>
        <Reveal order={2} className="twa-main">
          <p className="m-0">
            All of Freshpaint's data lived in Snowflake, which had an agent layer that let me query it in plain language. I asked how many events users created at three points: during initial setup, after 24 hours, and after 30 days. I looked past day one because of the waiting room, the screen I designed to tell users their data was on its way. It lists every defined event, and some users might not reach it until weeks into setup. I asked for percentiles instead of an average, since an average would hide the edge cases.
          </p>
        </Reveal>
        <Reveal order={2} className="twa-aside">
          <figure className="m-0 flex flex-col gap-2">
            <div className="rounded-[14px] border border-hairline-strong bg-white/[0.04] px-[clamp(14px,calc(var(--u)*1.6),26px)] py-[clamp(4px,calc(var(--u)*0.6),10px)] [&_td:first-child]:whitespace-normal [&_td]:py-[clamp(12px,calc(var(--u)*1.3),22px)] [&_td]:text-[clamp(15px,calc(var(--u)*1.3),24px)]">
              <DataTable
                hideHeader
                caption="Events created per user, at three points in setup"
                columns={['When', 'Events per user']}
                rows={[
                  ['Initial setup and 24 hours', 'Mostly 1 to 2 events, occasionally a few more'],
                  ['30 days', 'Some around 15, outliers 20+'],
                ]}
              />
            </div>
            <Caption>Approximate ranges.</Caption>
          </figure>
        </Reveal>
      </div>
    </div>
  ),
}

export default beat
