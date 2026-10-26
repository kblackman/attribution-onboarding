import type { Beat } from '../engine/types'
import { Statement } from '../components/Statement'
import { SpotlightLine } from '../components/SpotlightLine'

const beat: Beat = {
  slug: 'problem',
  title: 'The problem',
  variant: 'statement',
  card: (
    <Statement
      headline="The problem"
      // present mode (T): draft, awaiting Kyle's approval
      tldr={[
        "Freshpaint's platform was powerful, but customers had no self-serve way to get set up.",
        "Getting set up meant dense documentation or a call with CS.",
      ]}
      body="Freshpaint's healthcare marketing analytics platform was powerful, but it had no self-serve system in place to help customers reach the value they'd paid for. Setup flows were confusing and offered little to no guidance. Getting set up correctly meant reading dense documentation or booking a call with CS or an account manager."
    />
  ),
  // lands on the next press: the card pushes back and this takes the screen. Then straight to 01 Discovery
  // (the three-paths visual was removed, per Kyle; SetupPaths.tsx is kept unregistered)
  cardOverlay: (
    <SpotlightLine>
      <span>Everyone knew it was an issue. </span>
      <span><em>Nobody prioritized fixing it.</em></span>
    </SpotlightLine>
  ),
}

export default beat
