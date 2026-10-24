import type { Beat } from '../engine/types'
import { Reveal } from '../components/Reveal'
import { SessionGrid } from '../visuals/SessionGrid'

const beat: Beat = {
  slug: 'pattern',
  title: 'A pattern was emerging',
  variant: 'statement',
  cardDense: true, // text-heavy: tighter top and bottom padding so it fits without scrolling
  card: (
    <div>
      <Reveal as="h2" className="m-0 text-headline font-bold">
        A pattern was emerging
      </Reveal>
      <Reveal order={1} className="mt-[clamp(18px,calc(var(--u)*2.2),36px)] flex max-w-[64ch] flex-col gap-[0.65em] sm:gap-[0.8em] text-statement text-fg-muted text-pretty">
        <p className="m-0">
          We held regular research sessions with a pool of customer accounts. In most of them, customers shared their screen, whether to try a new feature, show us a bug, or walk us through how they used something we'd already released.
        </p>
        <p className="m-0">
          Over two days, I sat in on four of these sessions. Each time a customer shared their screen, their Attribution dashboard was only half set up. Some hadn't connected their ad sources, so their spend data never appeared. Others hadn't enabled AI, so Recommendation Cards never showed up. The thread was the same: customers paying for a feature they weren't getting full value from.
        </p>
      </Reveal>
      <Reveal as="p" order={2} className="m-0 mt-[clamp(12px,calc(var(--u)*3),56px)] text-kicker font-semibold text-accent">
        Was it a coincidence, or a pattern?
      </Reveal>
    </div>
  ),
  visual: {
    component: SessionGrid,
    description:
      'Four video call tiles appear one at a time: Day 1, New feature. Day 1, Bug walkthrough. Day 2, Adoption check-in. Day 2, New feature. Each shows a customer sharing the same half-set-up Attribution dashboard, with spend and recommendation areas empty, and a hand-drawn circle marks the empty area as each tile lands. The last tile then zooms to fill the screen. Generic avatars, no names or data. Placeholder shapes stand in for the final visual.',
  },
}

export default beat
