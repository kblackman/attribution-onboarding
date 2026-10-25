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
      body="I brought it up with the team. PM and Eng both agreed it was a problem. When I asked where it sat on the roadmap, the answer was that it didn't."
    />
  ),
  visual: {
    component: TeamChat,
    description:
      'A team chat thread in the #team-indigo channel, after the research sessions. Kyle Blackman: Noticed something over these past few customer sessions. Seems like almost everyone we spoke to had an Attribution dashboard that was only half set up. Am I crazy? PM: You\'re not crazy. Setup has been a known pain point. Even our CEO has called it out. Eng: Yeah, not surprised honestly. There are a bunch of things that have to be configured before that page shows anything useful. Kyle Blackman: Got it. Are there any plans to address this in the near future? PM: Not right now.',
  },
}

export default beat
