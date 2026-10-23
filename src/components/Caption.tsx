import type { ReactNode } from 'react'

/** Small gray caption under a visual, as in the case study. */
export function Caption({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`m-0 max-w-[70ch] text-ui text-caption ${className}`}>{children}</p>
}
