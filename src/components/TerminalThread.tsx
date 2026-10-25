import { motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'

export interface TerminalExchange {
  /** Kyle's prompt, verbatim. */
  prompt: string
  /** The response, condensed. */
  response: string
  /** Shown while the response is on its way (e.g. "Searching", "Thinking"). */
  working?: string
  /** Seconds the working indicator runs before the response lands. */
  workFor?: number
}

interface TerminalThreadProps {
  exchanges: TerminalExchange[]
  /** How many exchanges have started (the current one plays; earlier ones are complete). */
  shownCount: number
  /** Play the current exchange (prompt, working indicator, response). False shows it complete at once. */
  animateCurrent: boolean
  reducedMotion?: boolean
  /** Small caption under the window. */
  caption?: string
  className?: string
}

/**
 * A conversation with a coding assistant, as a generic terminal window: dark, monospace, a prompt marker
 * for Kyle's messages, a short working indicator before each response. Not any real tool's interface.
 * Separate from ChatThread (team chat). Evidence tier.
 */
export function TerminalThread({ exchanges, shownCount, animateCurrent, reducedMotion = false, caption, className = '' }: TerminalThreadProps) {
  return (
    <figure className={`m-0 flex flex-col gap-3 ${className}`}>
      <div className="overflow-hidden rounded-[14px] border border-hairline-strong bg-card-to font-mono text-[clamp(13px,calc(var(--u)*1.3),23px)] leading-[1.55] shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-[0.45em] border-b border-hairline px-[1em] py-[0.7em]" aria-hidden="true">
          {[0, 1, 2].map((d) => (
            <span key={d} className="block h-[0.62em] w-[0.62em] rounded-full bg-white/[0.18]" />
          ))}
          <span className="ml-[0.6em] text-[0.82em] text-fg-soft">terminal</span>
        </div>
        <ol className="m-0 flex list-none flex-col gap-[1.1em] p-[1.2em]">
          {exchanges.slice(0, shownCount).map((x, i) => {
            const playing = animateCurrent && i === shownCount - 1 && !reducedMotion
            const work = x.workFor ?? 1.2
            return (
              <li key={i} className="flex flex-col gap-[0.5em]">
                <motion.p
                  className="m-0 grid grid-cols-[1.4em_minmax(0,1fr)] text-fg"
                  initial={playing ? { opacity: 0, y: 6 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE_DECK }}
                >
                  <span className="text-fg-soft" aria-hidden="true">›</span>
                  <span>{x.prompt}</span>
                </motion.p>
                <div className="relative grid grid-cols-[1.4em_minmax(0,1fr)]">
                  <span />
                  <div className="relative">
                    {playing && (
                      <motion.span
                        className="absolute left-0 top-0 flex items-center gap-[0.5em] text-fg-soft"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 1, 0] }}
                        transition={{ duration: work, times: [0, 0.12, 0.88, 1], delay: 0.35 }}
                        aria-hidden="true"
                      >
                        <Spinner />
                        {x.working ?? 'Thinking'}
                      </motion.span>
                    )}
                    <motion.p
                      className="m-0 border-l-2 border-hairline-strong pl-[0.9em] text-fg-muted"
                      initial={playing ? { opacity: 0, y: 6 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: playing ? 0.35 + work : 0, ease: EASE_DECK }}
                    >
                      {x.response}
                    </motion.p>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
      {caption && <figcaption className="text-[clamp(11px,calc(var(--u)*0.9),15px)] text-fg-soft">{caption}</figcaption>}
    </figure>
  )
}

/** Three dots pulsing in turn. Opacity only. */
function Spinner() {
  return (
    <span className="inline-flex gap-[0.2em]" aria-hidden="true">
      {[0, 1, 2].map((d) => (
        <motion.span
          key={d}
          className="block h-[0.32em] w-[0.32em] rounded-full bg-fg-soft"
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
        />
      ))}
    </span>
  )
}

/** Total seconds for one exchange to play out (for auto-advance timing). */
export const exchangeDuration = (x: TerminalExchange) => 0.35 + (x.workFor ?? 1.2) + 0.45
