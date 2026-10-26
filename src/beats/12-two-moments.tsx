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
        "During setup, most users created one or two events. A simple list worked.",
        "By 30 days, some had many more. So the waiting room uses a grid that wraps after every four.",
      ]}
      body={
        <>
          <p>
            Most users created only one or two events during initial setup, with no sign of anyone creating them in bulk. A simple list covered the majority and could still stretch if needed.
          </p>
          <p>
            The waiting room told a different story. The 24-hour numbers barely changed, but by 30 days, users had created more events. For anyone reaching the waiting room weeks into setup, a list would get bulky. So I designed a grid that wraps to a new row after every four events.
          </p>
        </>
      }
    />
  ),
}

export default beat
