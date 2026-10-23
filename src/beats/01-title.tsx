import type { Beat } from '../engine/types'
import { Reveal } from '../components/Reveal'
import { TagRow } from '../components/TagRow'
import { AttributionResolve } from '../visuals/AttributionResolve'

const beat: Beat = {
  slug: 'title',
  title: 'Diagnosing the problem, not the symptom',
  cardGlow: true,
  card: (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col justify-center py-6">
        <Reveal as="h1" className="m-0 text-display font-extrabold text-balance">
          <span className="block">Diagnosing the problem,</span>
          <span className="block text-accent">not the symptom</span>
        </Reveal>
        <Reveal as="p" order={1} className="m-0 mt-[clamp(20px,calc(var(--u)*2.6),44px)] max-w-[40ch] text-lead text-fg-muted text-pretty">
          How a few offhand moments on customer calls led to an onboarding framework at Freshpaint.
        </Reveal>
      </div>
      <Reveal order={2} className="border-t border-hairline pt-[clamp(18px,calc(var(--u)*2.2),36px)]">
        <TagRow
          label="Skills"
          tags={['Root Cause Analysis', 'Codebase Investigation', 'Data-Informed Design', 'Rapid Prototyping', 'Cross-Functional Collaboration']}
        />
      </Reveal>
    </div>
  ),
  visual: {
    component: AttributionResolve,
    description:
      'An Attribution page whose widgets all start in an empty state, then fill in one by one, metrics first, then a trend chart, a bar chart, and a table, until the page is populated and healthy. Placeholder shapes stand in for the real screens.',
  },
}

export default beat
