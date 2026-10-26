import type { Beat } from '../engine/types'
import { Statement } from '../components/Statement'
import { CodeConversation, EXCHANGES } from '../visuals/CodeConversation'

const beat: Beat = {
  slug: 'before-prototyping',
  title: 'Checking before prototyping',
  variant: 'statement',
  card: (
    <Statement
      wide
      headline="Checking before prototyping"
      // present mode (T): draft, awaiting Kyle's approval
      tldr={[
        "Front-loading setup meant pulling every required step into one guided flow.",
        "The biggest question: could Event Creation's drawer move into it?",
      ]}
      body={
        <>
          <p>
            Front-loading setup meant pulling every required step into one guided flow. Whether that was possible would decide how simple the flow could be, so I checked before prototyping anything.
          </p>
          <p>The biggest question was Event Creation. Its drawer lived on the Events page. If it couldn't move into the new flow, I'd have to design around it.</p>
        </>
      }
    />
  ),
  visual: {
    component: CodeConversation,
    steps: EXCHANGES.length,
    description:
      'A terminal-style conversation with Claude Code, reconstructed from the session. Kyle: Can you dig into Events and locate the Create Events Drawer? Response: Found it. The drawer lives inside the Events section. Kyle: What fields are required in order to create an event? Response: Only two: Event name and CSS selector. Kyle: Are there any dependencies for this drawer on the Events page? Response: No. The drawer is self-contained, and everything it needs lives inside it. Kyle: How feasible would it be to surface this drawer in Attribution? Would it break anything in the Events page? Response: Very feasible. A few lines would let you surface it anywhere, and the original location in Events stays intact.',
  },
}

export default beat
