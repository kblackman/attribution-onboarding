import type { Beat } from '../engine/types'
import { Reveal } from '../components/Reveal'
import { AttributionResolve } from '../visuals/AttributionResolve'

/*
  05 Impact, "The result": a frameless statement (Kyle's brief) split into Before and After, the After column
  in accent as the screen's one yellow moment. Then 04 Solution's Attribution dashboard resolves section by section.
*/
const beat: Beat = {
  slug: 'the-result',
  title: 'The result',
  variant: 'statement',
  cardDense: true,
  card: (
    <div className="flex flex-col">
      <Reveal as="h2" className="m-0 text-story font-extrabold">
        The result
      </Reveal>
      <div className="mt-[clamp(20px,calc(var(--u)*3),52px)] grid max-w-[1400px] grid-cols-1 gap-[clamp(24px,calc(var(--u)*3.4),64px)] text-statement text-pretty md:grid-cols-2">
        <Reveal order={1} className="flex flex-col gap-[0.6em]">
          <h3 className="m-0 text-label font-normal uppercase tracking-[0.12em] text-fg-soft">Before the redesign</h3>
          <p className="m-0 text-fg-muted">Users ran into six empty states while getting set up, and none of them guided them toward the next step.</p>
        </Reveal>
        <Reveal order={2} className="flex flex-col gap-[0.6em]">
          <h3 className="m-0 text-label font-normal uppercase tracking-[0.12em] text-accent">After the redesign</h3>
          <p className="m-0 text-accent">
            Users moved from the setup flow to the waiting room to a working dashboard on their first try. The only empty states left were the unavoidable ones, and each told users why it was there and what to do next.
          </p>
          <p className="m-0 mt-[0.4em] text-[0.7em] font-semibold text-accent">9 possible empty states reduced to 3.</p>
        </Reveal>
      </div>
    </div>
  ),
  visual: {
    component: AttributionResolve,
    description:
      'The new Attribution dashboard, as the setup flow leaves it, starts with every section loading. One by one they resolve: the setup progress banner, the AI recommendations bar, the filters, then the Source performance chart with its bars growing. The page scrolls down as the banner to connect ad sources and the source table resolve, until the whole dashboard is working. Rebuilt from the Figma designs, mock data.',
  },
}

export default beat
