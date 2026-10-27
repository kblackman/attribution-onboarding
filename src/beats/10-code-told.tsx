import type { Beat } from '../engine/types'
import { Tldr } from '../components/Tldr'
import { BulletItem, BulletList } from '../components/Bullets'
import { Reveal } from '../components/Reveal'
import { StepStatusList } from '../components/StepStatusList'
import { SpotlightLine } from '../components/SpotlightLine'

// Evidence tier: a card, because it holds an artifact (the v1 status list).
const beat: Beat = {
  slug: 'code-told',
  title: 'What the code told me',
  cardDense: true,
  // the official kickoff of the prototype (Kyle, 2026-10-25): lands on the next press, the card pushes back
  cardOverlay: (
    <SpotlightLine>
      <span>I had all the info I needed. </span>
      <span><em>Time to start building.</em></span>
    </SpotlightLine>
  ),
  card: (
    <div>
      <Reveal as="h2" className="m-0 text-story font-extrabold">
        What the code told me
      </Reveal>
      <div className="text-with-aside mt-[clamp(18px,calc(var(--u)*2.6),46px)] gap-y-[0.8em] text-lead text-fg-muted text-pretty">
        <Reveal order={1} className="twa-main">
          <Tldr
            short={
              // Kyle's bullets, 2026-10-26
              <BulletList className="gap-[0.5em]">
                <BulletItem>The Event Creation drawer was self-contained, so it could easily be surfaced in the flow</BulletItem>
                <BulletItem>The AI toggle was easy to pull in, so it came along as well</BulletItem>
                <BulletItem>The lift to move Ad sources into the flow was too heavy to bring in for v1, redirect back to Attribution instead</BulletItem>
              </BulletList>
            }
          >
            <p className="m-0">
              The drawer was fully self-contained. It had no dependency on the Events page, so surfacing it in Attribution's new setup flow took only a few lines of code, and it could stay in Events for anyone used to creating events there.
            </p>
          </Tldr>
        </Reveal>
        <Reveal order={2} className="twa-aside">
          <StepStatusList
            label="How each step that used to leave Attribution was handled in v1"
            items={[
              { step: 'Event Creation', outcome: 'Moved into the flow', state: 'done' },
              { step: 'Enable AI', outcome: 'Moved into the flow', state: 'done' },
              { step: 'Connect ad sources', outcome: 'Auto-redirect back (full move planned later)', state: 'partial' },
            ]}
          />
        </Reveal>
        <Reveal order={2} className="twa-rest">
          <Tldr short={null}>
            <p className="m-0">
              Moving the AI toggle into the flow was also a light lift, so it came along too. Connecting ad sources was heavier and stayed out of v1. Instead, I added an automatic redirect back to Attribution after the OAuth flow finished, so users no longer had to find their way back on their own.
            </p>
          </Tldr>
        </Reveal>
      </div>
    </div>
  ),
}

export default beat
