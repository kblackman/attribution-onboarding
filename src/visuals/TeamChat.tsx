import type { VisualProps } from '../engine/types'
import { useVisualPlayback } from '../engine/useVisualPlayback'
import { ChatThread, type ChatMessage } from '../components/ChatThread'

/*
  Beat 4 visual: the team thread, full screen. Kyle's messages and the PM and Eng replies are Kyle's approved
  wording; the PM's last reply is still his placeholder. Messages land one at a time,
  slowly enough to read at this size. Tune the timing here (seconds).
*/
export const TIMING = {
  start: 0.7, // first message, after the frame settles
  stagger: 1.8, // between messages
  settle: 1.2, // after the last message, before the visual counts as finished
}

const MESSAGES: ChatMessage[] = [
  {
    author: 'Kyle Blackman',
    time: '10:42 AM',
    text: 'Noticed something over these past few customer sessions. Seems like almost everyone we spoke to had an Attribution dashboard that was only half set up. Am I crazy?',
    reactions: [{ emoji: '👀', count: 2 }],
  },
  { author: 'PM', time: '10:44 AM', text: "You're not crazy. Setup has been a known pain point. Even our CEO has called it out." },
  { author: 'Eng', time: '10:45 AM', text: 'Yeah, not surprised honestly. There are a bunch of things that have to be configured before that page shows anything useful.', reactions: [{ emoji: '👍', count: 1 }] },
  { author: 'Kyle Blackman', time: '10:47 AM', text: 'Got it. Are there any plans to address this in the near future?' },
  { author: 'PM', time: '10:48 AM', text: 'Not right now.' },
]
const TOTAL = TIMING.start + (MESSAGES.length - 1) * TIMING.stagger + 0.6 + TIMING.settle

export function TeamChat(props: VisualProps) {
  const mode = useVisualPlayback(props, props.reducedMotion ? 0.6 : TOTAL)
  return (
    <div className="absolute inset-0 flex items-center justify-center px-[var(--gutter)] pb-[clamp(72px,11vh,120px)] pt-[clamp(56px,8vh,96px)]">
      <ChatThread
        size="large"
        className="w-[min(100%,980px)]"
        channel="team-indigo"
        divider="After the research sessions"
        placeholderNote="Last message is a placeholder, final wording to come"
        messages={MESSAGES}
        shown={mode !== 'empty'}
        instant={mode === 'done'}
        start={TIMING.start}
        stagger={TIMING.stagger}
      />
    </div>
  )
}
