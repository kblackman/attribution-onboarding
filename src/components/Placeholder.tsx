import type { ReactNode } from 'react'

interface PlaceholderProps {
  /** Short label, e.g. "Placeholder". */
  label: string
  /** What goes here when the real asset is ready. */
  description: string
  /** Final aspect ratio, e.g. "16 / 10". */
  ratio: string
  className?: string
  children?: ReactNode
}

/** Clearly labeled stand-in for a visual that isn't ready, at its final aspect ratio. Deck .ph styling. */
export function Placeholder({ label, description, ratio, className = '', children }: PlaceholderProps) {
  return (
    <div
      className={`relative flex w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border-[1.5px] border-dashed border-hairline-strong bg-white/[0.025] p-4 text-center text-ui text-fg-soft ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {children}
      <span className="text-label uppercase text-accent">{label}</span>
      <span className="max-w-[46ch]">{description}</span>
    </div>
  )
}

/** Small corner badge used when a working visual is built from placeholder shapes. */
export function PlaceholderBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-dashed border-hairline-strong bg-page/80 px-3 py-1.5 text-label uppercase text-fg-soft max-[720px]:rounded-xl max-[720px]:tracking-[0.1em]">
      <span className="block h-1.5 w-1.5 flex-none rounded-full bg-accent" aria-hidden="true" />
      {children}
    </span>
  )
}
