import type { Beat } from '../engine/types'
import { Statement } from '../components/Statement'

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
      ]}
      body={
        <>
          <p>
            Most customers defined only a handful of events. Half had four or fewer, and two or three was the most common. A simple list covered the majority during setup and could still stretch if needed.
          </p>
          <p>
            The long tail told a different story. Nearly a quarter of customers had 10 or more, and one had 55. The waiting room lists every defined event, so for those customers a list would get bulky. So I designed a grid that wraps to a new row after every four events.
          </p>
        </>
      }
    />
  ),
}

export default beat
