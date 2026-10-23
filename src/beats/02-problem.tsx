import type { Beat } from '../engine/types'
import { Statement } from '../components/Statement'
import { SetupPaths } from '../visuals/SetupPaths'

const beat: Beat = {
  slug: 'problem',
  title: 'The problem',
  variant: 'statement',
  cardSteps: 2, // the kicker lands on the second press
  card: (
    <Statement
      headline="The problem"
      body="Freshpaint's healthcare marketing analytics platform was powerful, but it didn't help customers reach the value they'd paid for. Setup flows were confusing and offered little to no guidance. Getting set up correctly meant reading dense documentation or booking a call with CS or an account manager."
      kickerStyle="spotlight"
      kicker={
        <>
          <span>Everyone knew it was a problem. </span>
          <span><em>Nobody had put it on the roadmap.</em></span>
        </>
      }
    />
  ),
  visual: {
    component: SetupPaths,
    description:
      'A simplified product screen with three paths leading away from it, to Documentation, a CS call, and an Account manager. Placeholder shapes stand in for the final illustration.',
  },
}

export default beat
