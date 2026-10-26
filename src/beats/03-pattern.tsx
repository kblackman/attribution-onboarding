import type { Beat } from '../engine/types'
import { Statement } from '../components/Statement'
import { SpotlightLine } from '../components/SpotlightLine'
import { SessionGrid } from '../visuals/SessionGrid'

const beat: Beat = {
  slug: 'pattern',
  title: 'How it all started',
  variant: 'statement',
  cardDense: true, // text-heavy: tighter top and bottom padding so it fits without scrolling
  card: (
    <Statement
      wide
      headline="How it all started"
      // present mode (T): draft, awaiting Kyle's approval
      tldr={[
        "Over two days, I sat in on four customer research sessions.",
        "Each time a customer shared their screen, their Attribution dashboard was only half set up.",
      ]}
      body={
        <>
          <p>
            We held regular research sessions with a pool of customer accounts. In most of them, customers shared their screen, whether to try a new feature, show us a bug, or walk us through how they used something we'd already released.
          </p>
          <p>
            Over two days, I sat in on four of these sessions. Each time a customer shared their screen, their Attribution dashboard was only half set up. Some hadn't connected their ad sources, so their spend data never appeared. Others hadn't enabled AI, so Recommendation Cards never showed up. The thread was the same: customers paying for a feature they weren't getting full value from.
          </p>
        </>
      }
    />
  ),
  // the punchline gets the Moments treatment: the statement pushes back and the question takes the screen
  cardOverlay: (
    <SpotlightLine>
      <span>Was it a coincidence, </span>
      <span><em>or a pattern?</em></span>
    </SpotlightLine>
  ),
  visual: {
    component: SessionGrid,
    description:
      'Four video call tiles appear one at a time: Day 1, New feature. Day 1, Bug walkthrough. Day 2, Adoption check-in. Day 2, New feature. Each shows a customer sharing the same half-set-up Attribution dashboard, with spend and recommendation areas empty, and a hand-drawn circle marks the empty area as each tile lands. The last tile then zooms to fill the screen. Generic avatars, no names or data. Placeholder shapes stand in for the final visual.',
  },
}

export default beat
