import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { beats } from './beats'
import { cardStepCount, useStepEngine } from './engine/useStepEngine'
import { placeBeats, placeLabel } from './engine/sections'
import { Card, type CardStatus } from './components/Card'
import { VisualFrame, type VisualStatus } from './components/VisualFrame'
import { Overlay } from './components/Overlay'
import { Controls } from './components/Controls'
import { SectionIndex } from './components/SectionIndex'
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
const FRAMED = new Set(['card'])

export function App() {
  const engine = useStepEngine(beats)
  const places = useMemo(() => placeBeats(beats), [])
  const { steps, index, step, direction } = engine
  const reduced = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set([0]))
  const [menuOpen, setMenuOpen] = useState(false)
  const countRef = useRef<HTMLButtonElement>(null)

  // section index: jump to a beat's first step; number keys open a section by its number
  const sectionCards = useMemo(() => places.map((p, b) => ({ p, b })).filter(({ p }) => p.isSectionCard), [places])
  const closeMenu = useCallback((refocus = true) => {
    setMenuOpen(false)
    if (refocus) countRef.current?.focus({ preventScroll: true })
  }, [])
  const jumpToBeat = useCallback(
    (b: number) => {
      setMenuOpen(false)
      engine.go(steps.findIndex((s) => s.beat === b))
      rootRef.current?.focus({ preventScroll: true })
    },
    [engine, steps],
  )

  // card content reveals once per beat, the first time its card is current
  useEffect(() => {
    if (step.kind === 'card' && !revealed.has(step.beat)) setRevealed((s) => new Set(s).add(step.beat))
  }, [step, revealed])

  const begin = useCallback(() => {
    // inside a Framer embed, a click has to hand the iframe keyboard focus
    window.focus()
    setMenuOpen(false)
    rootRef.current?.focus({ preventScroll: true })
  }, [])

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key
      if (k === 's' || k === 'S') {
        e.preventDefault()
        if (menuOpen) closeMenu()
        else setMenuOpen(true)
        return
      }
      if (k === 'Escape' && menuOpen) {
        e.preventDefault()
        closeMenu()
        return
      }
      if (/^[1-9]$/.test(k)) {
        const target = sectionCards.find(({ p }) => Number(p.number) === Number(k))
        if (target) {
          e.preventDefault()
          jumpToBeat(target.b)
        }
        return
      }
      if (menuOpen) return // the index handles its own keys
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
  }, [engine, steps.length, menuOpen, closeMenu, sectionCards, jumpToBeat])

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
  const lastStepIndex = (b: number, kind: string) => steps.findLastIndex((s) => s.beat === b && s.kind === kind)

  // multi-step visuals ask to move on (auto-advance); only honored if the reader hasn't moved since
  const stepRef = useRef(step)
  stepRef.current = step
  const requesters = useMemo(
    () =>
      beats.map((_, b) => (sub: number) => {
        const cur = stepRef.current
        if (cur.beat === b && cur.kind === 'visual' && cur.sub === sub) engine.next()
      }),
    [engine.next],
  )
  const near = (i: number) => i >= 0 && Math.abs(i - index) <= 1

  const cb = step.beat
  // as in the decks, the hero carries its own Begin control, so the bar stays out of the way until it's left
  const onHero = beats[cb].variant === 'hero' && step.kind === 'card'
  const presentation = useMemo(() => ({ next: engine.next }), [engine.next])
  const place = placeLabel(places[cb])
  const announce = `${place.replace(' · ', ', ')}. ${beats[cb].title}. ${
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

          const lastSub = cardStepCount(beat) - 1
          const sub = b === cb && step.kind === 'card' ? step.sub : b > cb ? 0 : lastSub
          const cardOverlayOn = !!beat.cardOverlay && b === cb && step.kind === 'card' && sub === lastSub

          let cardStatus: CardStatus
          if (b > cb) cardStatus = 'below'
          else if (b === cb) cardStatus = step.kind !== 'card' ? 'gone' : cardOverlayOn ? 'pushed' : 'active'
          // decks keep the previous card dimmed behind the next one, but only when the next one is framed too
          else cardStatus = !beat.visual && b === cb - 1 && step.kind === 'card' && FRAMED.has(beats[cb].variant ?? 'card') ? 'behind' : 'gone'

          let visualStatus: VisualStatus = 'pre'
          if (b < cb) visualStatus = 'post'
          else if (b === cb) visualStatus = step.kind === 'visual' ? 'active' : step.kind === 'overlay' ? 'dimmed' : 'pre'

          const vi = stepIndex(b, 'visual')
          const viLast = lastStepIndex(b, 'visual')
          const oi = stepIndex(b, 'overlay')
          const visualNear = vi >= 0 && index >= vi - 1 && index <= viLast + 1
          const visualSteps = Math.max(1, beat.visual?.steps ?? 1)
          const visualSub = b === cb && step.kind === 'visual' ? step.sub : b > cb || (b === cb && step.kind === 'card') ? 0 : visualSteps - 1

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
                label={beat.title}
                zIndex={b * 10 + 1}
              >
                {beat.card}
              </Card>
              {beat.cardOverlay && (
                <Overlay shown={cardOverlayOn} reducedMotion={reduced} zIndex={b * 10 + 3}>
                  {beat.cardOverlay}
                </Overlay>
              )}
              {beat.visual && (
                <VisualFrame
                  id={`v-${beat.slug}`}
                  visual={beat.visual}
                  status={visualStatus}
                  mounted={visualNear || near(oi)}
                  sub={visualSub}
                  requestNext={requesters[b]}
                  startFinished={b === cb && direction === -1}
                  reducedMotion={reduced}
                  onComplete={completers[b]}
                  zIndex={b * 10 + 2}
                />
              )}
              {beat.visual && beat.overlay && (near(oi) || visualNear) && (
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
      <SectionIndex
        open={menuOpen}
        beats={beats}
        places={places}
        currentBeat={cb}
        sectionNumbers={sectionCards.map(({ p }) => p.number)}
        onJump={jumpToBeat}
        onClose={closeMenu}
      />
      <Controls
        menuOpen={menuOpen}
        onToggleMenu={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
        countRef={countRef}
        hidden={onHero}
        label={place}
        progress={steps.length > 1 ? index / (steps.length - 1) : 1}
        canPrev={!engine.isFirst}
        canNext={!engine.isLast}
        onPrev={engine.prev}
        onNext={engine.next}
      />
    </div>
  )
}
