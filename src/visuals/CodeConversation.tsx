import { useEffect, useRef } from 'react'
import type { VisualProps } from '../engine/types'
import { TerminalThread, exchangeDuration, type TerminalExchange } from '../components/TerminalThread'

/*
  Beat 10 visual: the reconstructed Claude Code session, as a generic terminal. One exchange per key press
  (prompt verbatim, a ✻ spinner with an elapsed timer, a tool-call line, a condensed response). The tool-call
  lines and the later elapsed times are generic placeholders, not the real session. With no key press it moves on by itself,
  forward only. The first search runs longer: in the real session it took 15 to 25 seconds.
  Tune the timing here (seconds).
*/
export const TIMING = {
  firstSearch: 3.2, // the long one
  search: 1.3,
  readAfter: 2.6, // after a response lands, before auto-advancing
}

export const EXCHANGES: TerminalExchange[] = [
  {
    prompt: 'Can you dig into Events and locate the Create Events Drawer?',
    response: 'Found it. The drawer lives inside the Events section.',
    working: 'Searching',
    workFor: TIMING.firstSearch,
    elapsed: 18, // the real search took 15 to 25 seconds
    tool: { call: 'Search(Create Events Drawer)', result: 'Done' },
  },
  {
    prompt: 'What fields are required in order to create an event?',
    response: 'Only two: Event name and CSS selector.',
    working: 'Searching',
    workFor: TIMING.search,
    elapsed: 4,
    tool: { call: 'Read(Create Events Drawer)', result: 'Done' },
  },
  {
    prompt: 'Are there any dependencies for this drawer on the Events page?',
    response: 'No. The drawer is self-contained, and everything it needs lives inside it.',
    working: 'Thinking',
    workFor: TIMING.search,
    elapsed: 5,
    tool: { call: 'Search(Events page dependencies)', result: 'Done' },
  },
  {
    prompt: 'How feasible would it be to surface this drawer in Attribution? Would it break anything in the Events page?',
    response: 'Very feasible. A few lines would let you surface it anywhere, and the original location in Events stays intact.',
    working: 'Thinking',
    workFor: TIMING.search,
    elapsed: 6,
    tool: { call: 'Read(Attribution)', result: 'Done' },
  },
]

export function CodeConversation({ active, startFinished, reducedMotion, sub, requestNext }: VisualProps) {
  const prev = useRef(-1)
  const forward = prev.current === sub - 1 && !startFinished
  // only count steps taken while this visual is on screen; before that, the first active step is an arrival
  useEffect(() => {
    prev.current = active ? sub : -1
  }, [sub, active])

  // auto-advance forward only, and never past the last exchange (the next press leaves the beat)
  useEffect(() => {
    if (!active || startFinished || sub >= EXCHANGES.length - 1) return
    const t = window.setTimeout(() => requestNext(sub), (exchangeDuration(EXCHANGES[sub]) + TIMING.readAfter) * 1000)
    return () => window.clearTimeout(t)
  }, [active, startFinished, sub, requestNext])

  return (
    <div className="absolute inset-0 flex items-start justify-center px-[var(--gutter)] pb-[clamp(84px,13vh,140px)] pt-[clamp(48px,8vh,96px)]">
      <TerminalThread
        className="h-full w-[min(100%,1080px)]"
        exchanges={EXCHANGES}
        // empty until it first becomes active (so the first exchange plays); kept while fading out after the last
        shownCount={active || sub > 0 ? sub + 1 : 0}
        animateCurrent={forward}
        reducedMotion={reducedMotion}
        caption="Reconstructed from my session."
      />
    </div>
  )
}
