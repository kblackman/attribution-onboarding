import type { Ref } from 'react'

interface ControlsProps {
  /** Fades the bar out (deck behavior on the hero). */
  hidden?: boolean
  /** Where the reader is, e.g. "01 · 2/3". */
  label: string
  progress: number
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
  /** The progress label opens the section index, as in the decks. */
  menuOpen: boolean
  onToggleMenu: () => void
  countRef: Ref<HTMLButtonElement>
  /** The Next button, so the portfolio edition's first-run coach can point at it. */
  nextRef?: Ref<HTMLButtonElement>
  /** Portfolio edition: Pause / Play for an autoplaying walkthrough. Omitted when nothing is autoplaying. */
  autoplay?: { playing: boolean; onToggle: () => void }
}

const Arrow = ({ flip }: { flip?: boolean }) => (
  <svg viewBox="0 0 22 12" fill="none" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
    <path d="M1 6H21M21 6L15.6 1M21 6L15.6 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** Deck chrome: 1px progress line on top; on the bottom, the progress label (opens the section index) and Back / Next pills. */
const PauseIcon = () => (
  <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
    <rect x="2" y="1.5" width="2.6" height="9" rx="0.8" />
    <rect x="7.4" y="1.5" width="2.6" height="9" rx="0.8" />
  </svg>
)
const PlayIcon = () => (
  <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
    <path d="M3 1.8v8.4a.6.6 0 0 0 .9.5l6.7-4.2a.6.6 0 0 0 0-1L3.9 1.3a.6.6 0 0 0-.9.5Z" />
  </svg>
)

export function Controls({ hidden = false, label, progress, canPrev, canNext, onPrev, onNext, menuOpen, onToggleMenu, countRef, nextRef, autoplay }: ControlsProps) {
  return (
    <>
      <div className="fixed left-0 top-0 z-[60] h-px w-full bg-white/[0.08]" aria-hidden="true">
        <div
          className="h-full origin-left bg-accent transition-transform duration-[600ms] ease-[cubic-bezier(.16,.84,.34,1)] motion-reduce:transition-none"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
      <nav
        aria-label="Presentation"
        aria-hidden={hidden || undefined}
        inert={hidden}
        style={{ opacity: hidden ? 0 : 1 }}
        className="transition-opacity duration-[400ms] ease-out motion-reduce:transition-none fixed inset-x-0 bottom-[max(10px,calc(6.5vh-30px))] z-[70] flex items-center justify-between px-[calc(var(--gutter)+4px)] max-[720px]:bottom-3.5 max-[720px]:px-4"
      >
        <button
          ref={countRef}
          type="button"
          className="count"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls="section-index"
          aria-label={`${label}. All beats`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onToggleMenu}
        >
          <span aria-hidden="true">{label}</span>
          <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3.5 8.5L7 5l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          {autoplay && (
            <button
              type="button"
              className="pill autoplay"
              aria-label={autoplay.playing ? 'Pause the walkthrough (P)' : 'Play the walkthrough (P)'}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={autoplay.onToggle}
            >
              {autoplay.playing ? <PauseIcon /> : <PlayIcon />}
              <span className="max-[720px]:sr-only">{autoplay.playing ? 'Pause' : 'Play'}</span>
            </button>
          )}
          <button type="button" className="pill secondary" aria-label="Previous step" aria-disabled={!canPrev} onClick={onPrev}>
            <Arrow flip />
            Back
          </button>
          <button ref={nextRef} type="button" className="pill primary" aria-label="Next step" aria-disabled={!canNext} onClick={onNext}>
            Next
            <Arrow />
          </button>
        </div>
      </nav>
    </>
  )
}
