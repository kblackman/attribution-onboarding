import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'

/*
  First-run coach, ported from the Tiled return deck (tiled-presentation): a light popover above the Next
  button with a keycap diagram (left and right keys pressing in turn), shown once the reader lands on the first
  step after the hero. Portfolio edition only. Got it, Escape, or any move away closes it; "Don't show again"
  lasts for the browser session, as in the deck. On touch screens it explains swiping instead, without keycaps.
*/
const NEVER_KEY = 'attribution-coach-off'

export const coachSuppressed = () => {
  try {
    return sessionStorage.getItem(NEVER_KEY) === '1'
  } catch {
    return false
  }
}

const Key = ({ dir, hot }: { dir: 'up' | 'left' | 'down' | 'right'; hot?: boolean }) => {
  const d = {
    up: 'M8 13V3M8 3L3.5 7.5M8 3L12.5 7.5',
    left: 'M13 8H3M3 8L7.5 3.5M3 8L7.5 12.5',
    down: 'M8 3V13M8 13L3.5 8.5M8 13L12.5 8.5',
    right: 'M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5',
  }[dir]
  return (
    <span className={`coach-key ${dir}${hot ? ' hot' : ''}`}>
      <svg viewBox="0 0 16 16" fill="none">
        <path d={d} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

interface KeyCoachProps {
  shown: boolean
  anchorRef: RefObject<HTMLElement | null>
  onDismiss: () => void
}

export function KeyCoach({ shown, anchorRef, onDismiss }: KeyCoachProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [never, setNever] = useState(false)
  const [touch] = useState(() => typeof matchMedia !== 'undefined' && !matchMedia('(hover: hover) and (pointer: fine)').matches)

  // sit above the Next button, the pointer aimed at its center
  const place = () => {
    const el = ref.current
    const a = anchorRef.current
    if (!el || !a) return
    const r = a.getBoundingClientRect()
    el.style.right = `${Math.max(8, window.innerWidth - r.right)}px`
    el.style.bottom = `${window.innerHeight - r.top + 16}px`
    const c = el.getBoundingClientRect()
    el.style.setProperty('--ax', `${Math.max(24, Math.min(c.width - 24, r.left + r.width / 2 - c.left))}px`)
  }
  useLayoutEffect(() => {
    if (shown) place()
  })
  useEffect(() => {
    if (!shown) return
    const onResize = () => place()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  })

  // remember "Don't show again" whenever it closes with the box ticked
  const wasShown = useRef(false)
  useEffect(() => {
    if (wasShown.current && !shown && never) {
      try {
        sessionStorage.setItem(NEVER_KEY, '1')
      } catch {
        // storage unavailable: it still won't come back this visit
      }
    }
    wasShown.current = shown
  }, [shown, never])

  return (
    <div
      ref={ref}
      className={`coach${shown ? ' show' : ''}`}
      role="dialog"
      aria-labelledby="coach-title"
      aria-hidden={!shown}
      inert={!shown}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {!touch && (
        <div className="coach-art" aria-hidden="true">
          <div className="coach-keys">
            <Key dir="up" />
            <Key dir="left" hot />
            <Key dir="down" />
            <Key dir="right" hot />
          </div>
        </div>
      )}
      {touch ? (
        <>
          <h3 id="coach-title">Swipe to move through the case study</h3>
          <p>Swipe left to go forward and right to go back. You can also use the buttons below.</p>
        </>
      ) : (
        <>
          <h3 id="coach-title">Move through the case study with your keyboard</h3>
          <p>Press &rarr; to go forward and &larr; to go back. You can also use the buttons below.</p>
        </>
      )}
      <div className="coach-foot">
        <label>
          <input type="checkbox" checked={never} onChange={(e) => setNever(e.target.checked)} /> Don&rsquo;t show again
        </label>
        <button type="button" className="coach-ok" onClick={onDismiss}>
          Got it
        </button>
      </div>
    </div>
  )
}
