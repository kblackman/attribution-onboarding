import type { Beat } from '../engine/types'
import { Reveal } from '../components/Reveal'
import { ChatThread } from '../components/ChatThread'
import { SpotlightLine } from '../components/SpotlightLine'
import { EmptyStateMontage } from '../visuals/EmptyStateMontage'

// Evidence tier: a card, because it holds an artifact (the team thread).
const beat: Beat = {
  slug: 'hunch',
  title: 'Checking the hunch',
  cardDense: true,
  card: (
    <div>
      <Reveal as="h2" className="m-0 text-story font-extrabold">
        Checking the hunch
      </Reveal>
      <div className="text-with-aside mt-[clamp(18px,calc(var(--u)*2.6),46px)] text-lead text-fg-muted text-pretty">
        <Reveal order={1} className="twa-main">
          <p className="m-0">
            I brought it up with the team. PM and Eng both agreed it was a problem. When I asked where it sat on the roadmap, the answer was that it didn't.
          </p>
        </Reveal>
        <ChatThread
          className="twa-aside"
          channel="team-indigo"
          placeholderNote="Placeholder messages, final wording to come"
          messages={[
            { author: 'Kyle Blackman', time: '10:42 AM', text: "Noticed something across this week's research sessions. Almost every customer's Attribution dashboard was only half set up. Missing ad sources, AI not enabled.", reactions: [{ emoji: '👀', count: 2 }] },
            { author: 'PM', time: '10:44 AM', text: "Yeah, we've seen that. Setup has been a known pain point." },
            { author: 'Eng', time: '10:45 AM', text: "Agreed. The flow doesn't really guide anyone through it.", reactions: [{ emoji: '👍', count: 1 }] },
            { author: 'Kyle Blackman', time: '10:47 AM', text: 'Is fixing it on the roadmap anywhere?' },
            { author: 'PM', time: '10:48 AM', text: 'Not right now.' },
          ]}
        />
        <div className="twa-rest mt-[0.8em] flex flex-col gap-[0.8em]">
          <Reveal order={2}>
            <p className="m-0">
              Before pushing further, I wanted to know how widespread it was. Our masquerade tool let us see the product exactly as a customer saw it, so I used it to look inside roughly 20 of our 200+ customer accounts. I didn't have to dig. Almost every account was either half set up or not set up at all. The fully configured ones were outliers.
            </p>
          </Reveal>
          {/* hands off to the montage: this screen's one yellow line */}
          <Reveal as="p" order={3} className="m-0 mt-[0.4em] text-kicker font-semibold text-accent">
            And it wasn't one empty state. It was many.
          </Reveal>
        </div>
      </div>
    </div>
  ),
  visual: {
    component: EmptyStateMontage,
    description:
      'Large dashboard screengrabs fall onto a table one at a time, each landing on top of the last. Each has its empty area circled by hand and labeled: No events. Events not defined. No ad sources. AI off. AI on, no events. Waiting on data, which is marked differently, with a dashed circle and a question mark. Then more keep falling, faster and faster, each circled, until the stack stops. Dummy dashboards only. Placeholder shapes stand in for the final screens.',
  },
  overlay: {
    trigger: 'auto',
    content: (
      <SpotlightLine>
        <span>Six different empty states. </span>
        <span><em>Were they six problems, or one?</em></span>
      </SpotlightLine>
    ),
  },
}

export default beat
