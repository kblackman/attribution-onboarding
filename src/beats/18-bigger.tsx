import type { Beat } from '../engine/types'
import { Statement } from '../components/Statement'
import { SpotlightLine } from '../components/SpotlightLine'
import { PatternReuse } from '../visuals/PatternReuse'

/*
  05 Impact, "Bigger than Attribution": the final beat. A frameless statement (it holds no artifact, so the
  System's story tier rather than the brief's standard card), the reuse visual, then the closing overlay,
  which holds until the reader navigates away. Nothing loops back to the start.
*/
const beat: Beat = {
  slug: 'bigger',
  title: 'Bigger than Attribution',
  variant: 'statement',
  card: (
    <Statement
      wide
      headline="Bigger than Attribution"
      body={
        <>
          <p>
            The fix outgrew Attribution. Other areas of the app had the same setup problem, so the onboarding pattern, stepped progress indicator, and waiting room became the design team's go-to. Web Analytics was the first to adopt them.
          </p>
          <p>
            The waiting room mattered most. Waiting on data, typically 24 hours, was one of the biggest causes of empty states across the app. Now every area that had to wait had a way to explain it.
          </p>
        </>
      }
    />
  ),
  visual: {
    component: PatternReuse,
    description:
      'A product window for Attribution shows the setup guide, its stepped progress indicator filling through four steps, and the waiting room card. It moves left as a second window for Web Analytics lands beside it with the same progress indicator and waiting room card, identical in style. Web Analytics wording is shown as placeholder bars.',
  },
  overlay: {
    trigger: 'auto',
    content: (
      <SpotlightLine>
        <span>I went looking for the cause of Attribution's empty states. </span>
        <span><em>I came back with a reliable pattern the whole team could use.</em></span>
      </SpotlightLine>
    ),
  },
}

export default beat
