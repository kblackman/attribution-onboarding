import type { Beat } from '../engine/types'
import { WALK_STEPS, OnboardingWalkthrough } from '../visuals/OnboardingWalkthrough'

// Opens 04 Solution directly on the walkthrough: the section card sets it up (Kyle's call, 2026-10-25).
// A closing story beat with Kyle's copy follows.
const beat: Beat = {
  slug: 'setup-flow',
  title: 'The new setup flow',
  visual: {
    component: OnboardingWalkthrough,
    steps: WALK_STEPS,
    description:
      'An automated walkthrough of the new Attribution setup flow, rebuilt from the Figma designs with mock data. A cursor drives each step while a four-step progress bar fills: it creates an event in the Create Event drawer (event name and CSS selector, then Create); the event appears; on Define conversion events it tries to continue without a low-funnel event and hits the error "At least one event must be marked Low Funnel to continue.", then marks the event Low funnel and continues; on Connect ad sources (optional) it chooses Skip for now, after the note that this can be set up later is circled; on Enable AI recommendations it turns the toggle on and finishes. The waiting room confirms setup and says data is on its way, with a handwritten note: "The waiting room: setup\'s done, data is on its way". It then gives way to the full Attribution dashboard, which scrolls from the setup reminder and chart down to an invitation to connect ad sources and the source table.',
  },
}

export default beat
