import type { ReactNode } from 'react'
import { usePresentMode } from '../engine/presentMode'

/**
 * Full copy by default; in present mode, the short version instead (a line or two, set one size up).
 * `short={null}` drops the passage in present mode. For Statement beats, use its `tldr` prop instead.
 */
export function Tldr({ short, children, className = 'text-statement' }: { short: ReactNode; children: ReactNode; className?: string }) {
  const present = usePresentMode()
  if (!present) return <>{children}</>
  if (short === null) return null
  return <p className={`m-0 text-fg ${className}`}>{short}</p>
}
