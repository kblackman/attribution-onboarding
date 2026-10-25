import type { Beat } from '../engine/types'
import { Statement } from '../components/Statement'
import { WALK_STEPS, OnboardingWalkthrough } from '../visuals/OnboardingWalkthrough'

// Story, then Evidence: the walkthrough is what Kyle presented in the meeting from "Bringing it to the team".
const beat: Beat = {
  slug: 'showing-team',
  title: 'Showing the team',
  variant: 'statement',
  card: (
    <Statement
      wide
      headline="Showing the team"
      body={
        <>
          <p>
            I went into that meeting proud of what I'd built, and a little nervous. I hoped the team would see the same value in it that I did.
          </p>
          <p>
            The flow would get new users fully set up on their own, without a call to CS. It would also give us something we'd never had: an onboarding framework we could reuse across other parts of the app.
          </p>
        </>
      }
    />
  ),
  visual: {
    component: OnboardingWalkthrough,
    steps: WALK_STEPS,
    description:
      'An automated walkthrough of the new Attribution setup flow, rebuilt from the Figma designs with mock data. A cursor drives each step while a four-step progress bar fills: it creates an event in the Create Event drawer (event name and CSS selector, then Create); the event appears; on Define conversion events it tries to continue without a low-funnel event and hits the error "At least one event must be marked Low Funnel to continue.", then marks the event Low funnel and continues; on Connect ad sources (optional) it skips, past the note that this can be set up later; on Enable AI recommendations it turns the toggle on and finishes. The waiting room confirms setup and says data is on its way, then gives way to the full Attribution dashboard. Corner counters for times leaving Attribution and empty states hit stay at 0 throughout.',
  },
}

export default beat
