import { useId } from 'react'
import { motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'

export interface TweakOption {
  id: string
  label: string
}

interface TweaksPanelProps {
  /** What the toggle controls, e.g. "Data load". */
  label: string
  options: TweakOption[]
  value: string
  /** Optional readout under the toggle, e.g. "22 events". */
  readout?: string
  title?: string
  reducedMotion?: boolean
  className?: string
}

/**
 * A prototype's tweaks panel: a small floating dark panel with a segmented toggle, the kind built into a
 * prototype to swap data loads on the fly. Display only (the presentation drives `value`). Reusable.
 */
export function TweaksPanel({ label, options, value, readout, title = 'Tweaks', reducedMotion = false, className = '' }: TweaksPanelProps) {
  const id = useId()
  return (
    <div className={`rounded-[1cqw] border border-hairline-strong bg-card-to/95 p-[1cqw] text-[clamp(10px,1.2cqw,17px)] text-fg-muted shadow-[0_18px_40px_rgba(0,0,0,0.5)] ${className}`}>
      <div className="mb-[0.7em] flex items-center justify-between gap-[1em]">
        <span className="font-bold text-fg">{title}</span>
        <span className="text-[0.85em] uppercase tracking-[0.12em] text-fg-soft">{label}</span>
      </div>
      <div className="relative grid grid-flow-col gap-[0.2em] rounded-[0.7em] bg-white/[0.06] p-[0.25em]">
        {options.map((o) => {
          const on = o.id === value
          return (
            <span key={o.id} className={`relative z-[1] rounded-[0.55em] px-[0.9em] py-[0.45em] text-center font-semibold ${on ? 'text-card-to' : 'text-fg-muted'}`}>
              {on && (
                <motion.span
                  layoutId={`${id}-pill`}
                  className="absolute inset-0 -z-[1] rounded-[0.55em] bg-fg"
                  transition={reducedMotion ? { duration: 0 } : { duration: 0.45, ease: EASE_DECK }}
                />
              )}
              {o.label}
            </span>
          )
        })}
      </div>
      {readout && <div className="mt-[0.7em] text-[0.9em] tabular-nums text-fg-soft">{readout}</div>}
    </div>
  )
}
