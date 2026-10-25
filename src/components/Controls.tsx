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
}

const Arrow = ({ flip }: { flip?: boolean }) => (
  <svg viewBox="0 0 22 12" fill="none" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
    <path d="M1 6H21M21 6L15.6 1M21 6L15.6 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** Deck chrome: 1px progress line on top; on the bottom, the progress label (opens the section index) and Back / Next pills. */
export function Controls({ hidden = false, label, progress, canPrev, canNext, onPrev, onNext, menuOpen, onToggleMenu, countRef }: ControlsProps) {
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
          <button type="button" className="pill secondary" aria-label="Previous step" aria-disabled={!canPrev} onClick={onPrev}>
            <Arrow flip />
            Back
          </button>
          <button type="button" className="pill primary" aria-label="Next step" aria-disabled={!canNext} onClick={onNext}>
            Next
            <Arrow />
          </button>
        </div>
      </nav>
    </>
  )
}
