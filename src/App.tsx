import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { beats } from './beats'
import { useStepEngine } from './engine/useStepEngine'
import { Card, type CardStatus } from './components/Card'
import { VisualFrame, type VisualStatus } from './components/VisualFrame'
import { Overlay } from './components/Overlay'
import { Controls } from './components/Controls'
import { DUR } from './engine/motion'
import { usePrefersReducedMotion } from './engine/reducedMotion'
import { PresentationContext } from './engine/presentation'

/*
  Performance: only beats within WINDOW of the current beat are mounted at all. A beat further back
  has fully faded out, and one further ahead hasn't been reached, so neither needs DOM, layers, or
  running animations. Inside the window, a visual's content mounts only when its step is the
  current one or adjacent to it, so video and heavy visuals load just in time and unload after.
*/
const WINDOW = 1

export function App() {
  const engine = useStepEngine(beats)
  const { steps, index, step, direction } = engine
  const reduced = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set([0]))

  // card content reveals once per beat, the first time its card is current
  useEffect(() => {
    if (step.kind === 'card' && !revealed.has(step.beat)) setRevealed((s) => new Set(s).add(step.beat))
  }, [step, revealed])

  const begin = useCallback(() => {
    // inside a Framer embed, a click has to hand the iframe keyboard focus
    window.focus()
    rootRef.current?.focus({ preventScroll: true })
  }, [])

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key
      const forward = k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !(e.target instanceof HTMLButtonElement))
      const back = k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp'
      if (forward || back || k === 'Home' || k === 'End') {
        e.preventDefault()
        if (forward) engine.next()
        else if (back) engine.prev()
        else engine.go(k === 'Home' ? 0 : steps.length - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [engine, steps.length])

  // swipe: horizontal only, so a tall card can still scroll on a phone
  const touch = useRef<{ x: number; y: number } | null>(null)
  const onTouchStart = (e: React.TouchEvent) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
  const onTouchEnd = (e: React.TouchEvent) => {
    const t = touch.current
    touch.current = null
    if (!t) return
    const dx = e.changedTouches[0].clientX - t.x
    const dy = e.changedTouches[0].clientY - t.y
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) engine.next()
      else engine.prev()
    }
  }

  // stable per-beat completion callbacks, so visuals don't restart on re-render
  const completers = useMemo(() => beats.map((_, b) => () => engine.visualComplete(b)), [engine.visualComplete])

  const stepIndex = (b: number, kind: string) => steps.findIndex((s) => s.beat === b && s.kind === kind)
  const near = (i: number) => i >= 0 && Math.abs(i - index) <= 1

  const cb = step.beat
  // as in the decks, the hero carries its own Begin control, so the bar stays out of the way until it's left
  const onHero = beats[cb].variant === 'hero' && step.kind === 'card'
  const presentation = useMemo(() => ({ next: engine.next }), [engine.next])
  const announce = `Beat ${cb + 1} of ${beats.length}, ${beats[cb].title}. ${
    step.kind === 'card' ? '' : step.kind === 'visual' ? beats[cb].visual?.description ?? '' : 'Overlay.'
  }`

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      className="app-root fixed inset-0 touch-pan-y"
      onPointerDown={begin}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <PresentationContext.Provider value={presentation}>
      <main className="fixed inset-0 overflow-hidden">
        {beats.map((beat, b) => {
          if (Math.abs(b - cb) > WINDOW) return null

          const lastSub = Math.max(1, beat.cardSteps ?? 1) - 1
          const sub = b === cb && step.kind === 'card' ? step.sub : b > cb ? 0 : lastSub

          let cardStatus: CardStatus
          if (b > cb) cardStatus = 'below'
          else if (b === cb) cardStatus = step.kind === 'card' ? 'active' : 'gone'
          else cardStatus = !beat.visual && b === cb - 1 && step.kind === 'card' ? 'behind' : 'gone'

          let visualStatus: VisualStatus = 'pre'
          if (b < cb) visualStatus = 'post'
          else if (b === cb) visualStatus = step.kind === 'visual' ? 'active' : step.kind === 'overlay' ? 'dimmed' : 'pre'

          const vi = stepIndex(b, 'visual')
          const oi = stepIndex(b, 'overlay')

          return (
            <div key={beat.slug}>
              <Card
                status={cardStatus}
                variant={beat.variant}
                align={beat.align}
                dense={beat.cardDense}
                sub={sub}
                revealed={revealed.has(b)}
                revealLead={b === 0 ? 0 : DUR.revealLead}
                glow={beat.cardGlow}
                reducedMotion={reduced}
                label={`Beat ${b + 1}: ${beat.title}`}
                zIndex={b * 10 + 1}
              >
                {beat.card}
              </Card>
              {beat.visual && (
                <VisualFrame
                  id={`v-${beat.slug}`}
                  visual={beat.visual}
                  status={visualStatus}
                  mounted={near(vi) || near(oi)}
                  startFinished={b === cb && direction === -1}
                  reducedMotion={reduced}
                  onComplete={completers[b]}
                  zIndex={b * 10 + 2}
                />
              )}
              {beat.visual && beat.overlay && (near(oi) || near(vi)) && (
                <Overlay shown={b === cb && step.kind === 'overlay'} reducedMotion={reduced} zIndex={b * 10 + 3}>
                  {beat.overlay.content}
                </Overlay>
              )}
            </div>
          )
        })}
      </main>
      </PresentationContext.Provider>

      <p className="sr-only" aria-live="polite">{announce}</p>
      <Controls
        hidden={onHero}
        beat={cb + 1}
        beatCount={beats.length}
        progress={steps.length > 1 ? index / (steps.length - 1) : 1}
        canPrev={!engine.isFirst}
        canNext={!engine.isLast}
        onPrev={engine.prev}
        onNext={engine.next}
      />
    </div>
  )
}
