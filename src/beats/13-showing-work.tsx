import type { Beat } from '../engine/types'
import { Statement } from '../components/Statement'
import { LOADS, LoadPrototype } from '../visuals/LoadPrototype'

// Story, then Evidence: the stress test gets its own beat, with the prototype as its proof.
const beat: Beat = {
  slug: 'showing-work',
  title: 'Showing my work',
  variant: 'statement',
  card: (
    <Statement
      wide
      headline="Showing my work"
      body={
        <p>
          Then I stress-tested both. I built a tweaks panel into the prototype that swapped between real customer data loads and updated the UI on the fly. I knew Eng would ask how it scaled, and I wanted to show my work. The panel later became part of our shared prototyping skill, so every new prototype came with one.
        </p>
      }
    />
  ),
  visual: {
    component: LoadPrototype,
    steps: LOADS.length,
    description:
      'The prototype with its tweaks panel, a small floating panel with a four-option toggle: Low, Average, High, Outlier. Low shows 1 event in the setup step\'s simple list; Average shows 2 events in the same list. High shows 15 events in the waiting room\'s grid, wrapping to a new row after every 4 events; Outlier shows 22 events in the same grid. Mock event names, placeholder UI.',
  },
}

export default beat
