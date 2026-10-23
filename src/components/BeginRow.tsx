import { usePresentation } from '../engine/presentation'

/**
 * The decks' Begin row for the hero: an accent pill that advances, with an optional hint beside it.
 * Clicking it also gives a Framer embed (iframe) keyboard focus. The hint hides on touch screens.
 */
export function BeginRow({ hint, center = false }: { hint?: string; center?: boolean }) {
  const { next } = usePresentation()
  return (
    <div className={`mt-[clamp(30px,calc(var(--u)*3.4),56px)] flex flex-wrap items-center gap-6 ${center ? 'justify-center' : ''}`}>
      <button type="button" className="begin" onClick={next}>
        Begin
        <svg viewBox="0 0 22 12" fill="none" aria-hidden="true">
          <path d="M1 6H21M21 6L15.6 1M21 6L15.6 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {hint && <span className="begin-hint text-ui tracking-[0.04em] text-fg-soft">{hint}</span>}
    </div>
  )
}
