import type { Beat } from '../engine/types'
import { Statement } from '../components/Statement'
import { LOADS, LoadPrototype } from '../visuals/LoadPrototype'

// "Showing my work" folded in (Kyle, 2026-11-05): the stress test is the payoff here, with the prototype as its proof,
// and the tweaks panel gets a pink annotation once the loads have played instead of a beat of its own.

const beat: Beat = {
  slug: 'two-moments',
  title: 'Two moments, two patterns',
  variant: 'statement',
  cardDense: true,
  card: (
    <Statement
      wide
      headline="Two moments, two patterns"
      // present mode (T): draft, awaiting Kyle's approval
      tldr={[
        "Most customers defined only a handful of events. A simple list worked.",
        "Nearly a quarter had 10 or more, and one had 55. So the waiting room uses a grid that wraps after every four.",
        "Then I put both to the test.",
      ]}
      body={
        <>
          <p>
            Most customers defined only a handful of events. Half had four or fewer, and two or three was the most common. A simple list covered the majority during setup and could still stretch if needed.
          </p>
          <p>
            The long tail told a different story. Nearly a quarter of customers had 10 or more, and one had 55. The waiting room screen lists every defined event, so for those customers a list would get bulky. So I designed a grid that wraps to a new row after every four events.
          </p>
          <p>Then I put both to the test.</p>
        </>
      }
    />
  ),
  visual: {
    component: LoadPrototype,
    steps: LOADS.length,
    description:
      'The prototype with its tweaks panel, a small floating panel with a four-option toggle: Low, Median, High, Outlier. Low shows 1 event in the setup step\'s simple list; Median shows 4 events in the same list. High shows 12 events in the waiting room\'s grid, wrapping to a new row after every 4 events; Outlier shows 55 events in the same grid, and the page scrolls to show them all. Then the prototype dims, the tweaks panel is circled in pink, and a handwritten note reads: Swaps real customer data loads to stress-test the UI. Now part of our shared prototyping skill.',
  },
}

export default beat
