import type { Beat } from '../engine/types'
import { Reveal } from '../components/Reveal'

/*
  05 Impact, "The result": a frameless statement (Kyle's brief) split into Before and After, the After column
  in accent as the screen's one yellow moment. The dashboard that used to follow
  was dropped (Kyle, 2026-11-04: redundant after the walkthrough ends on it); AttributionResolve stays in visuals/.
*/
const beat: Beat = {
  slug: 'the-result',
  title: 'The result',
  variant: 'statement',
  cardDense: true,
  card: (
    <div className="mx-auto flex w-full max-w-[54ch] flex-col text-statement">
      <Reveal as="h2" className="m-0 text-story font-extrabold">
        The <span className="text-accent">result</span>
      </Reveal>
      <div className="mt-[clamp(20px,calc(var(--u)*3),52px)] grid grid-cols-1 gap-[clamp(24px,calc(var(--u)*3.4),64px)] text-statement text-pretty md:grid-cols-2">
        <Reveal order={1} className="flex flex-col gap-[0.6em]">
          <h3 className="m-0 text-label font-normal uppercase tracking-[0.12em] text-fg-soft">Before the redesign</h3>
          <p className="m-0 text-fg-muted">Users ran into six empty states while getting set up, and none of them guided them toward the next step.</p>
        </Reveal>
        <Reveal order={2} className="flex flex-col gap-[0.6em]">
          <h3 className="m-0 text-label font-normal uppercase tracking-[0.12em] text-accent">After the redesign</h3>
          <p className="m-0 text-accent">
            Users moved through a clear setup flow, one step at a time. Each step explained what it was for and helped them reach a complete setup with much less friction than before.
          </p>
          <p className="m-0 mt-[0.4em] text-[0.7em] font-semibold text-accent">9 possible empty states reduced to 3.</p>
        </Reveal>
      </div>
    </div>
  ),
}

export default beat
