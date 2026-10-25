import type { ReactNode } from 'react'

/**
 * An editorial pull statement for overlays: large Figtree italic between two short accent rules.
 * Pass each line as its own element to set the break, and wrap the line to emphasize in <em> (accent).
 */
export function SpotlightLine({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="block h-px w-[clamp(36px,calc(var(--u)*4),72px)] bg-accent" aria-hidden="true" />
      <p className="spotlight m-0 my-[clamp(22px,calc(var(--u)*3),48px)] max-w-[30ch] text-spotlight font-light italic text-fg text-balance">
        {children}
      </p>
      <span className="block h-px w-[clamp(36px,calc(var(--u)*4),72px)] bg-accent" aria-hidden="true" />
    </div>
  )
}
