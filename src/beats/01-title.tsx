import type { Beat } from '../engine/types'
import { Reveal } from '../components/Reveal'
import { TagRow } from '../components/TagRow'
import { BeginRow } from '../components/BeginRow'
import { AttributionResolve } from '../visuals/AttributionResolve'

const beat: Beat = {
  slug: 'title',
  title: 'Diagnosing the problem, not the symptom',
  variant: 'hero',
  card: (
    <div className="max-w-[1080px]">
      <Reveal as="h1" className="m-0 text-display font-extrabold text-balance">
        <span className="block">Diagnosing the problem,</span>
        <span className="block text-accent">not the symptom</span>
      </Reveal>
      <Reveal as="p" order={1} className="m-0 mt-[34px] max-w-[52ch] text-body text-fg-soft text-pretty">
        How a few offhand moments on customer calls led to an onboarding framework at Freshpaint.
      </Reveal>
      <Reveal order={2} className="mt-[clamp(24px,calc(var(--u)*3),46px)]">
        <TagRow
          label="Skills"
          tags={['Root Cause Analysis', 'Codebase Investigation', 'Data-Informed Design', 'Rapid Prototyping', 'Cross-Functional Collaboration']}
        />
      </Reveal>
      <Reveal order={3}>
        <BeginRow hint="Click to begin, then use arrow keys" />
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
