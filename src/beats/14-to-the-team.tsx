import type { Beat } from '../engine/types'
import { Reveal } from '../components/Reveal'
import { ChatThread, type ChatMessage } from '../components/ChatThread'
import { TEAM_THREAD } from '../visuals/TeamChat'

// Evidence tier: a card, because it holds an artifact (the team thread). A bookend to "Checking the hunch":
// same channel, its last two messages dimmed at the top, then the new ones land one at a time.
// seconds: a pause after the card lands, so the dimmed callback reads first, then one message at a time
const TIMING = { start: 2, stagger: 1 }

const MESSAGES: ChatMessage[] = [
  {
    author: 'Kyle Blackman',
    text: (
      <>
        <b className="font-bold text-fg">UPDATE:</b> Okay, I've finished the prototype for the Onboarding Flow. Instead of spilling out the details here and sharing a link, I think it would be more productive to go through it together on Zoom.
      </>
    ),
    reactions: [
      { emoji: '🎉', count: 3 },
      { emoji: '👀', count: 2 },
    ],
  },
  { author: 'Front-end Eng', text: 'Ooo! Exciting!' },
  { author: 'PM', text: "Sounds good! I'll put something on our calendars." },
  { author: 'Eng Lead', text: 'Add me to the invite please.' },
  { author: 'Back-end Eng', text: 'Same!' },
]

// no timestamps in this thread, so the old messages drop theirs too
const EARLIER = TEAM_THREAD.slice(-2).map(({ time: _time, ...m }) => m)

const beat: Beat = {
  slug: 'to-the-team',
  title: 'Bringing it to the team',
  cardDense: true,
  card: (
    <div>
      <Reveal as="h2" className="m-0 text-story font-extrabold">
        Bringing it to the team
      </Reveal>
      {/* the thread gets the wider column here, so its messages wrap less */}
      <div className="text-with-aside is-chat mt-[clamp(14px,calc(var(--u)*1.6),30px)] gap-y-[0.8em] text-lead text-fg-muted text-pretty">
        <Reveal order={1} className="twa-main flex flex-col gap-[0.8em]">
          <p className="m-0">
            With the prototype done, I had more than an idea to pitch. I had something the team could see and react to. I'd built it to sell the solution, not just to test it.
          </p>
          <p className="m-0">
            Instead of dropping a link in Slack, I asked for a meeting. I wanted our PM, front-end and back-end engineers, and eng lead on the same call, so I could walk them through it and answer their questions live.
          </p>
        </Reveal>
        <Reveal order={2} className="twa-aside">
          <ChatThread channel="team-indigo" earlier={EARLIER} divider="Later" messages={MESSAGES} compact start={TIMING.start} stagger={TIMING.stagger} />
        </Reveal>
      </div>
    </div>
  ),
}

export default beat
