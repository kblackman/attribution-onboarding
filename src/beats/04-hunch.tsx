import type { Beat } from '../engine/types'
import { Statement } from '../components/Statement'
import { TeamChat } from '../visuals/TeamChat'

const beat: Beat = {
  slug: 'hunch',
  title: 'Checking the hunch',
  variant: 'statement',
  card: (
    <Statement
      headline="Checking the hunch"
      // present mode (T): draft, awaiting Kyle's approval
      tldr={[
        "I asked the team if they'd noticed. They had.",
        "So I asked whether anything was planned to address it.",
        <em className="font-semibold text-accent">Nothing was.</em>,
      ]}
      body={
        <>
          <p>
            I brought it up with the team to see if anyone else had noticed. They had. PM and Eng both knew customers struggled to get fully set up. So I asked whether anything was planned to address it.
          </p>
          {/* the turn gets its own line so it can't be read past */}
          <p className="font-semibold italic text-accent">Nothing was.</p>
        </>
      }
    />
  ),
  visual: {
    component: TeamChat,
    description:
      'A team chat thread in the #team-indigo channel, after the research sessions. Kyle Blackman: Noticed something over these past few customer sessions. Seems like almost everyone we spoke to had an Attribution dashboard that was only half set up. Am I crazy? PM: You\'re not crazy. Setup has been a known pain point. Even our CEO has called it out. Eng: Yeah, not surprised honestly. There are a bunch of things that have to be configured before that page shows anything useful. Kyle Blackman: Got it. Are there any plans to address this in the near future? PM: Not right now.',
  },
}

export default beat
