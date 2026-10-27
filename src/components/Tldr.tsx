import type { ReactNode } from 'react'
import { usePresentMode } from '../engine/presentMode'
import { Bullet } from './Bullets'
import { PresentSwap } from './PresentSwap'

/**
 * Full copy by default; in present mode, the short version instead (a line or two, set one size up).
 * `short={null}` drops the passage in present mode. For Statement beats, use its `tldr` prop instead.
 */
export function Tldr({ short, children, className = 'text-statement' }: { short: ReactNode; children: ReactNode; className?: string }) {
  const present = usePresentMode()
  // crossfades on T (PresentSwap); a string is one point, with present mode's amber dot; anything else (a list)
  // brings its own markup
  const content = !present ? children : short === null ? null : typeof short === 'string' ? <Bullet>{short}</Bullet> : short
  return (
    <PresentSwap present={present} className={present ? `text-fg ${className}` : undefined}>
      {content}
    </PresentSwap>
  )
}
