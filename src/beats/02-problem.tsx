import type { Beat } from '../engine/types'
import { Statement } from '../components/Statement'
import { SpotlightLine } from '../components/SpotlightLine'
import { SetupPaths } from '../visuals/SetupPaths'

const beat: Beat = {
  slug: 'problem',
  title: 'The problem',
  cardGlow: true,
  card: (
    <Statement
      headline="The problem"
      body="Freshpaint's healthcare marketing analytics platform was powerful, but it had no self-serve system in place to help customers reach the value they'd paid for. Setup flows were confusing and offered little to no guidance. Getting set up correctly meant reading dense documentation or booking a call with CS or an account manager."
    />
  ),
  // lands on the next press: the card pushes back and this takes the screen
  cardOverlay: (
    <SpotlightLine>
      <span>Everyone knew it was a problem. </span>
      <span><em>Nobody prioritized fixing it.</em></span>
    </SpotlightLine>
  ),
  visual: {
    component: SetupPaths,
    description:
      'A simplified product screen with three paths leading away from it, to Documentation, a CS call, and an Account manager. Placeholder shapes stand in for the final illustration.',
  },
}

export default beat
