import type { ReactNode } from 'react'
import { HorizonLine } from './HorizonLine'

/**
 * A punchline, Moments tier: large Figtree italic, centered, with the horizon line drawing out beneath it
 * (the same signature as the hero and section titles). Pass each line as its own element to set the
 * break, and wrap the line that's the point in <em> (accent). Use as a beat's cardOverlay.
 */
export function SpotlightLine({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="spotlight m-0 mb-[clamp(22px,calc(var(--u)*3),48px)] max-w-[30ch] text-spotlight font-light italic text-fg text-balance">
        {children}
      </p>
      <HorizonLine width="min(40vw, 480px)" delay={0.35} />
    </div>
  )
}
