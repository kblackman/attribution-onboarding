interface ControlsProps {
  beat: number
  beatCount: number
  progress: number
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
}

const Arrow = ({ flip }: { flip?: boolean }) => (
  <svg viewBox="0 0 22 12" fill="none" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
    <path d="M1 6H21M21 6L15.6 1M21 6L15.6 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** Deck chrome: 1px progress line on top, beat count and Back / Next pills on the bottom. */
export function Controls({ beat, beatCount, progress, canPrev, canNext, onPrev, onNext }: ControlsProps) {
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
        className="fixed inset-x-0 bottom-[max(10px,calc(6.5vh-30px))] z-[70] flex items-center justify-between px-[calc(var(--gutter)+4px)] max-[720px]:bottom-3.5 max-[720px]:px-4"
      >
        <p className="m-0 text-ui tabular-nums tracking-[0.06em] text-fg-soft">
          Beat {beat} of {beatCount}
        </p>
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
