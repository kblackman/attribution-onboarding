import type { Beat } from '../engine/types'
import { Reveal } from '../components/Reveal'
import { StepStatusList } from '../components/StepStatusList'

// Evidence tier: a card, because it holds an artifact (the v1 status list).
const beat: Beat = {
  slug: 'code-told',
  title: 'What the code told me',
  cardDense: true,
  card: (
    <div>
      <Reveal as="h2" className="m-0 text-story font-extrabold">
        What the code told me
      </Reveal>
      <div className="text-with-aside mt-[clamp(18px,calc(var(--u)*2.6),46px)] gap-y-[0.8em] text-lead text-fg-muted text-pretty">
        <Reveal order={1} className="twa-main">
          <p className="m-0">
            The drawer was fully self-contained. It had no dependency on the Events page, so surfacing it in Attribution's new setup flow took only a few lines of code, and it could stay in Events for anyone used to creating events there.
          </p>
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
          <p className="m-0">
            Moving the AI toggle into the flow was also a light lift, so it came along too. Connecting ad sources was heavier and stayed out of v1. Instead, I added an automatic redirect back to Attribution after the OAuth flow finished, so users no longer had to find their way back on their own.
          </p>
        </Reveal>
      </div>
    </div>
  ),
}

export default beat
