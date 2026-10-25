import type { Beat } from '../engine/types'
import { Statement } from '../components/Statement'
import { SpotlightLine } from '../components/SpotlightLine'
import { EmptyStateMontage } from '../visuals/EmptyStateMontage'

const beat: Beat = {
  slug: 'widespread',
  title: 'How widespread was it?',
  variant: 'statement',
  card: (
    <Statement
      wide
      headline="How widespread was it?"
      body={
        <>
          <p>
            Before pushing further, I wanted to know how widespread it was. Our masquerade tool let us see a customer's actual account, populated with their own data, so I used it to look inside roughly 20 of our 200+ customer accounts. I didn't have to dig. Almost every account was either half set up or not set up at all. The fully configured ones were outliers.
          </p>
          {/* hands off to the montage: this screen's one yellow line */}
          <p className="mt-[0.3em] text-kicker font-semibold text-accent">And it wasn't one empty state. It was many.</p>
        </>
      }
    />
  ),
  visual: {
    component: EmptyStateMontage,
    description:
      'Large dashboard screenshots fall onto a table one at a time, each landing on top of the last. Each has its empty area circled by hand, with a handwritten label and an arrow: No events. Events not defined. No ad sources. AI off. AI on, no events. Waiting on data, which is marked differently, with a dashed circle and a question mark. Then more keep falling, faster and faster, each circled, until the stack stops. Dummy dashboards only. Placeholder shapes stand in for the final screens.',
  },
  overlay: {
    trigger: 'auto',
    content: (
      <SpotlightLine>
        <span>Six different empty states. </span>
        <span><em>Were they evidence of six problems, or just one?</em></span>
      </SpotlightLine>
    ),
  },
}

export default beat
