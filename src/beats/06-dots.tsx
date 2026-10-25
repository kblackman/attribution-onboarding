import type { Beat } from '../engine/types'
import { Statement } from '../components/Statement'
import { MappingBoard } from '../visuals/MappingBoard'

const beat: Beat = {
  slug: 'dots',
  title: 'Connecting the dots',
  variant: 'statement',
  cardDense: true,
  card: (
    <Statement
      wide
      headline="Connecting the dots"
      body={
        <>
          <p>
            I took a screenshot of every empty state I found. Every time I thought I'd seen them all, another one turned up. A single widget could have several empty states, depending on what was missing. Some seemed to come from the same missing step, and I couldn't tell why.
          </p>
          <p>
            I knew my team could explain it, but first I wanted to understand it myself. In FigJam, I used the screenshots as anchor points and mapped the setup flow from start to finish. I filled the space between them with the steps that led there, like Event Creation, linked everything with arrows, and annotated why each point occurred. Anywhere I saw friction, I called it out.
          </p>
        </>
      }
    />
  ),
  visual: {
    component: MappingBoard,
    description:
      'A whiteboard. The six empty-state screenshots from the montage drop on as anchor points, each still circled and labeled. Step boxes fill the gaps between them: Event Creation, Event Definition, Sources, AI settings. Arrows draw in to connect everything in order, and sticky notes pop up at three friction points. Placeholder shapes, no real customer data.',
  },
}

export default beat
