import type { Beat } from '../engine/types'
import { Statement } from '../components/Statement'
import { SpotlightLine } from '../components/SpotlightLine'
import { RIDE_STEPS, SetupRideAlong } from '../visuals/SetupRideAlong'

const beat: Beat = {
  slug: 'checking',
  title: 'Checking my work',
  variant: 'statement',
  cardDense: true,
  card: (
    <Statement
      wide
      headline="Checking my work"
      body={
        <>
          <p>
            With the flow mapped as I understood it, I brought it to the team. I wanted to know two things: was I missing any steps, and what caused each empty state?
          </p>
          <p>
            Their answers filled the gaps. The biggest surprise was that some empty states weren't indicative of a problem at all. The setup was complete, the account was just waiting on data ingestion. Though nothing communicated that to the user.
          </p>
          <p>With the flow confirmed, I could finally see the full path a customer had to take.</p>
        </>
      }
    />
  ),
  visual: {
    component: SetupRideAlong,
    steps: RIDE_STEPS,
    description:
      'The setup ride-along. A new customer travels the Attribution setup path one step at a time, with counters for times they left Attribution and empty states hit. 1: Attribution with nothing set up, empty state, no events. 2: they leave for Events. 3: Event Creation, create an event in the drawer and save. 4: navigate back to Attribution by hand. 5: empty state, events not defined; nothing points to the Manage conversions button. 6: the Manage conversions drawer slides up; mark events as mid or low funnel. 7: wait for data ingestion. 8: empty state, spend widgets empty, no ad sources. 9: they leave for Sources and an OAuth flow. 10: navigate back by hand. 11: empty state, Recommendation Cards, AI off. 12: they leave for Freshpaint AI settings and turn on the AI toggle. 13: navigate back by hand. 14: wait, cards take a full day to generate. Then the view zooms out to the whole map: they left Attribution three times and hit six empty states.',
  },
  overlay: {
    trigger: 'key', // the kicker waits for a deliberate press after the zoom-out
    content: (
      <SpotlightLine long>
        To set up Attribution properly, a new customer had to <em>leave it three times</em>, find their way back on their own, and push through <em>six empty states</em>.
      </SpotlightLine>
    ),
  },
}

export default beat
