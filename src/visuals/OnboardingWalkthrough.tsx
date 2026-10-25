import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'
import type { VisualProps } from '../engine/types'
import { PlaceholderBadge } from '../components/Placeholder'
import { EVENT_NAME, EVENT_SELECTOR, FlowScreen, type FlowUI } from './onboarding-screens'

/*
  04 Solution, "Showing the team": an automated walkthrough of the new setup flow, as Kyle presented it.
  One key press per step (8 steps), each step a short script for a simulated cursor: it clicks where the
  previous step left it, the screen responds, then it moves to the next target. With no key press it moves
  on by itself, forward only, HOLD seconds after a step's script ends (pacing after the Beat 7 ride-along).
  The button under the cursor shows its hover state once the cursor arrives. At the end the dashboard
  scrolls through the whole Attribution page.
  Screens live in onboarding-screens.tsx. Tune the timing here (seconds).
*/
export const TIMING = {
  hold: 1.8, // after a step's script ends, before auto-advancing
  move: 0.65, // cursor travel
  type: 0.055, // per character
}

type Frame = { at: number; to?: string; click?: boolean; set?: Partial<FlowUI> }
type Script = { enter?: Partial<FlowUI>; frames: Frame[] }

/** Frames that type `text` into a field, one character at a time, starting at `start`. */
const typing = (field: 'name' | 'selector', text: string, start: number): Frame[] =>
  Array.from(text, (_, i) => ({ at: start + i * TIMING.type, set: { [field]: text.slice(0, i + 1) } }))
const typed = (start: number, text: string) => start + text.length * TIMING.type

const INITIAL: FlowUI = { screen: 'setup', phase: 1, drawer: false, name: '', selector: '', focus: null, events: 0, low: false, error: false, later: false, ai: false, scroll: false, cursor: true }

const nameDone = typed(1.6, EVENT_NAME)
const selDone = typed(nameDone + 1.2, EVENT_SELECTOR)

// Kyle's eight steps
const SCRIPTS: Script[] = [
  // 1. entry: the setup flow, progress at step 1
  { frames: [{ at: 0.5, to: 'create' }] },
  // 2. Event Creation: the drawer slides in, name and CSS selector are filled, then Create
  {
    frames: [
      { at: 0.15, click: true, set: { drawer: true } },
      { at: 0.9, to: 'name' },
      { at: 1.5, click: true, set: { focus: 'name' } },
      ...typing('name', EVENT_NAME, 1.6),
      { at: nameDone + 0.4, to: 'selector' },
      { at: nameDone + 1.0, click: true, set: { focus: 'selector' } },
      ...typing('selector', EVENT_SELECTOR, nameDone + 1.2),
      { at: selDone + 0.4, to: 'save', set: { focus: null } },
    ],
  },
  // 3. one event created
  {
    frames: [
      { at: 0.15, click: true, set: { drawer: false, events: 1 } },
      { at: 1.3, to: 'continue' },
    ],
  },
  // 4. Event Definition: continue without a low-funnel event, hit the error, pause, mark it low funnel
  {
    frames: [
      { at: 0.15, click: true, set: { phase: 2 } },
      { at: 0.9, to: 'continue' },
      { at: 1.55, click: true, set: { error: true } },
      { at: 3.2, to: 'low' },
      { at: 3.85, click: true, set: { low: true, error: false } },
      { at: 4.6, to: 'continue' },
    ],
  },
  // 5. Connect Ad Sources: the note that it can be set up later, then Skip for now
  {
    frames: [
      { at: 0.15, click: true, set: { phase: 3 } },
      { at: 0.8, to: 'later' },
      { at: 1.1, set: { later: true } },
      { at: 2.6, to: 'skip' },
    ],
  },
  // 6. Enable AI: toggle on
  {
    frames: [
      { at: 0.15, click: true, set: { phase: 4, later: false } },
      { at: 0.9, to: 'toggle' },
      { at: 1.55, click: true, set: { ai: true } },
      { at: 2.3, to: 'continue' },
    ],
  },
  // 7. the waiting room: setup confirmed, data on its way
  {
    frames: [
      { at: 0.15, click: true, set: { screen: 'waiting' } },
      { at: 0.7, set: { cursor: false } },
    ],
  },
  // 8. resolve: the full Attribution dashboard, then a scroll down the whole page
  {
    frames: [
      { at: 0.8, set: { screen: 'dashboard' } },
      { at: 2.4, set: { scroll: true } },
    ],
  },
]
export const WALK_STEPS = SCRIPTS.length

const apply = (ui: FlowUI, frames: Frame[]) => frames.reduce((s, f) => (f.set ? { ...s, ...f.set } : s), ui)
const lastTarget = (frames: Frame[], fallback: string | null) => frames.reduce<string | null>((t, f) => f.to ?? t, fallback)

// each step starts from where the previous one ended
const BASES: FlowUI[] = []
const START_TARGET: (string | null)[] = []
SCRIPTS.reduce(
  ({ ui, target }, s) => {
    const base = { ...ui, ...s.enter }
    BASES.push(base)
    START_TARGET.push(target)
    return { ui: apply(base, s.frames), target: lastTarget(s.frames, target) }
  },
  { ui: INITIAL, target: null as string | null },
)

const W = 1440
const H = 900

export function OnboardingWalkthrough({ active, startFinished, reducedMotion: reduced, sub, requestNext }: VisualProps) {
  const step = Math.min(sub, WALK_STEPS - 1)
  const script = SCRIPTS[step]
  // Did we reach this step going forward? Decided once per step change, as derived state (a ref read on every
  // render flips back to false on the re-render the timeline itself triggers).
  const [arrival, setArrival] = useState({ sub, active, forward: false })
  if (arrival.sub !== sub || arrival.active !== active) {
    const forward = active && !startFinished && (arrival.active ? arrival.sub === sub - 1 : sub === 0)
    setArrival({ sub, active, forward })
  }

  // how many of this step's frames have played; arriving any other way than forward shows the step finished
  const play = arrival.forward && !reduced
  const [played, setPlayed] = useState(script.frames.length)
  useLayoutEffect(() => {
    if (!play) {
      setPlayed(script.frames.length)
      return
    }
    setPlayed(0)
    const timers = script.frames.map((f, i) => window.setTimeout(() => setPlayed(i + 1), f.at * 1000))
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [play, step, script])

  // auto-advance, forward only, and never past the last step (the next press leaves the beat)
  useEffect(() => {
    if (!active || startFinished || sub >= WALK_STEPS - 1) return
    const end = script.frames[script.frames.length - 1].at
    const t = window.setTimeout(() => requestNext(sub), ((reduced ? 0 : end) + TIMING.hold + (reduced ? 0.8 : 0)) * 1000)
    return () => window.clearTimeout(t)
  }, [active, startFinished, sub, script, reduced, requestNext])

  const frames = script.frames.slice(0, played)
  const ui = apply(BASES[step], frames)
  const target = lastTarget(frames, START_TARGET[step])
  const lastClick = frames.reduce((n, f, i) => (f.click ? i : n), -1)

  // hover: the button under the cursor, once the cursor has arrived there
  const [hover, setHover] = useState<string | null>(null)
  useEffect(() => {
    if (!play) {
      setHover(target)
      return
    }
    setHover(null)
    const t = window.setTimeout(() => setHover(target), TIMING.move * 700)
    return () => window.clearTimeout(t)
  }, [target, play])

  // scale the 1440 x 900 screen to the frame
  const frameRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  useLayoutEffect(() => {
    const el = frameRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(el.clientWidth / W))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // place the cursor on its target, measured in the screen's own pixels
  const [pos, setPos] = useState({ x: 1100, y: 720 })
  useLayoutEffect(() => {
    if (!target || !stageRef.current || !scale) return
    const stage = stageRef.current
    const el = stage.querySelector<HTMLElement>(`[data-t="${target}"]`)
    if (!el) return
    // layout offsets, not client rects: they ignore transforms (the frame's entrance zoom, the drawer sliding in),
    // so the cursor heads for where the target settles
    let x = el.offsetWidth / 2
    let y = el.offsetHeight / 2
    let n: HTMLElement | null = el
    while (n && n !== stage) {
      x += n.offsetLeft
      y += n.offsetTop
      n = n.offsetParent as HTMLElement | null
    }
    if (n === stage) setPos({ x, y })
  }, [target, scale, step, played])

  return (
    <div className="absolute inset-0 flex items-center justify-center px-[var(--gutter)] pb-[clamp(72px,11vh,120px)] pt-[clamp(56px,8vh,96px)]">
      <div className="absolute left-[calc(var(--gutter)+4px)] right-[calc(var(--gutter)+4px)] top-[clamp(16px,3vh,28px)]">
        <PlaceholderBadge>Rebuilt from the Figma designs, mock data</PlaceholderBadge>
      </div>
      <div
        className="relative flex flex-col"
        style={{ width: 'min(100%, calc((100dvh - clamp(56px,8vh,96px) - clamp(72px,11vh,120px)) * 1.6))', containerType: 'inline-size' }}
        aria-hidden="true"
      >
        <div ref={frameRef} className="relative w-full overflow-hidden rounded-[1.2cqw] shadow-[0_24px_60px_rgba(0,0,0,0.45)]" style={{ aspectRatio: `${W} / ${H}` }}>
          <div ref={stageRef} className="absolute left-0 top-0 origin-top-left" style={{ width: W, height: H, transform: `scale(${scale})` }}>
            <FlowScreen ui={ui} hover={ui.cursor ? hover : null} reduced={reduced} />
            <Cursor x={pos.x} y={pos.y} visible={ui.cursor} reduced={reduced} clickKey={lastClick >= 0 && play ? `${step}-${lastClick}` : null} />
          </div>
        </div>
      </div>
    </div>
  )
}

/** A simulated pointer, with a ring that pulses out on each click. */
function Cursor({ x, y, visible, reduced, clickKey }: { x: number; y: number; visible: boolean; reduced: boolean; clickKey: string | null }) {
  return (
    <motion.div
      className="pointer-events-none absolute left-0 top-0 z-20"
      initial={false}
      animate={{ x, y, opacity: visible ? 1 : 0 }}
      transition={reduced ? { duration: 0 } : { x: { duration: TIMING.move, ease: EASE_DECK }, y: { duration: TIMING.move, ease: EASE_DECK }, opacity: { duration: 0.3 } }}
    >
      {clickKey && (
        <motion.span
          key={clickKey}
          className="absolute -left-[18px] -top-[18px] block h-[36px] w-[36px] rounded-full border-[3px] border-fp-indigo"
          initial={{ scale: 0.3, opacity: 0.9 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      )}
      <svg width="26" height="30" viewBox="0 0 26 30" className="-translate-x-[3px] -translate-y-[2px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]">
        <path d="M3 2 L3 24 L9 18.5 L13.5 28 L17.5 26 L13 17 L21 17 Z" fill="#fff" stroke="#14151C" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    </motion.div>
  )
}
