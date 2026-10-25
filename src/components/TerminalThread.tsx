import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'

export interface TerminalExchange {
  /** Kyle's prompt, verbatim. */
  prompt: string
  /** The response, condensed. */
  response: string
  /** Status word on the spinner (e.g. "Searching", "Thinking"). */
  working?: string
  /** Seconds the spinner runs on screen before the answer lands. */
  workFor?: number
  /** The elapsed time the spinner counts up to, in seconds (the real wait, compressed into workFor). */
  elapsed?: number
  /** A tool call shown before the answer, as "● Name(argument)" with "⎿ result" under it. Generic placeholders. */
  tool?: { call: string; result: string }
}

interface TerminalThreadProps {
  exchanges: TerminalExchange[]
  /** How many exchanges have started (the current one plays; earlier ones are complete). */
  shownCount: number
  /** Play the current exchange. False shows it complete at once. */
  animateCurrent: boolean
  reducedMotion?: boolean
  /** Small caption under the window. */
  caption?: string
  className?: string
}

const STEP = { prompt: 0.35, tool: 0.25, answer: 0.45 }

/**
 * A reconstructed Claude Code session in a terminal: "> " prompts, ● bullets, a ✻ spinner with an elapsed
 * timer, tool-call lines with ⎿ results, and the prompt box at the bottom. Coral is Claude's accent and is
 * used only here. No logo, wordmark, or welcome banner. Separate from ChatThread (team chat). Evidence tier.
 */
export function TerminalThread({ exchanges, shownCount, animateCurrent, reducedMotion = false, caption, className = '' }: TerminalThreadProps) {
  // like a real terminal: grow until the window is full, then keep the newest lines in view
  const listRef = useRef<HTMLOListElement>(null)
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const follow = () => el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion ? 'auto' : 'smooth' })
    follow()
    const ro = new ResizeObserver(follow)
    for (const child of Array.from(el.children)) ro.observe(child)
    return () => ro.disconnect()
  }, [shownCount, reducedMotion])

  return (
    <figure className={`m-0 flex max-h-full min-h-0 flex-col gap-3 ${className}`}>
      <div className="flex min-h-0 flex-col overflow-hidden rounded-[14px] border border-hairline-strong bg-card-to font-mono text-[clamp(13px,calc(var(--u)*1.2),21px)] leading-[1.55] shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-[0.45em] border-b border-hairline px-[1em] py-[0.7em]" aria-hidden="true">
          {[0, 1, 2].map((d) => (
            <span key={d} className="block h-[0.62em] w-[0.62em] rounded-full bg-white/[0.18]" />
          ))}
          <span className="ml-[0.6em] text-[0.82em] text-fg-soft">terminal</span>
        </div>
        <ol
          ref={listRef}
          className="m-0 flex min-h-0 flex-1 list-none flex-col gap-[1.15em] overflow-hidden px-[1.2em] pb-[0.6em] pt-[1.1em]"
          style={{ maskImage: 'linear-gradient(to bottom, transparent 0, #000 1.6em)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 1.6em)' }}
        >
          {exchanges.slice(0, shownCount).map((x, i) => {
            const playing = animateCurrent && i === shownCount - 1 && !reducedMotion
            const work = x.workFor ?? 1.2
            const toolAt = STEP.prompt + work
            const answerAt = toolAt + (x.tool ? STEP.tool + 0.2 : 0)
            // always settle visible; only the newest exchange animates (so a fast press never strands a line)
            const appear = (at: number) => ({
              initial: playing ? { opacity: 0, y: 4 } : (false as const),
              animate: { opacity: 1, y: 0 },
              transition: playing ? { duration: 0.35, delay: at, ease: EASE_DECK } : { duration: 0 },
            })
            return (
              <li key={i} className="flex flex-col gap-[0.45em]">
                <motion.p className="m-0 grid grid-cols-[1.5em_minmax(0,1fr)] text-fg-soft" {...appear(0)}>
                  <span aria-hidden="true">&gt;</span>
                  <span className="text-fg">{x.prompt}</span>
                </motion.p>
                <div className="relative">
                  {playing && <Working label={x.working ?? 'Thinking'} elapsed={x.elapsed ?? Math.round(work * 3)} from={STEP.prompt} duration={work} />}
                  {x.tool && (
                    <motion.div className="text-fg-muted" {...appear(toolAt)}>
                      <p className="m-0 grid grid-cols-[1.5em_minmax(0,1fr)]">
                        <span className="text-coral" aria-hidden="true">●</span>
                        <span>
                          <b className="font-semibold text-fg">{x.tool.call.split('(')[0]}</b>
                          {x.tool.call.includes('(') ? `(${x.tool.call.split('(').slice(1).join('(')}` : ''}
                        </span>
                      </p>
                      <p className="m-0 grid grid-cols-[1.5em_minmax(0,1fr)] text-fg-soft">
                        <span />
                        <span>
                          <span aria-hidden="true">⎿&nbsp;&nbsp;</span>
                          {x.tool.result}
                        </span>
                      </p>
                    </motion.div>
                  )}
                  <motion.p className={`m-0 grid grid-cols-[1.5em_minmax(0,1fr)] text-fg-muted ${x.tool ? 'mt-[0.45em]' : ''}`} {...appear(answerAt)}>
                    <span className="text-fg" aria-hidden="true">●</span>
                    <span>{x.response}</span>
                  </motion.p>
                </div>
              </li>
            )
          })}
        </ol>
        {/* the prompt box, waiting for the next message */}
        <div className="mx-[1.2em] mb-[1.1em] mt-[0.4em] flex items-center gap-[0.6em] rounded-[0.5em] border border-hairline-strong px-[0.9em] py-[0.55em] text-fg-soft" aria-hidden="true">
          <span>&gt;</span>
          <motion.span
            className="block h-[1.1em] w-[0.55em] bg-fg-muted"
            animate={reducedMotion ? { opacity: 1 } : { opacity: [1, 1, 0, 0] }}
            transition={reducedMotion ? { duration: 0 } : { duration: 1.1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
          />
        </div>
      </div>
      {caption && <figcaption className="text-[clamp(11px,calc(var(--u)*0.9),15px)] text-fg-soft">{caption}</figcaption>}
    </figure>
  )
}

/** "✻ Searching… (18s · esc to interrupt)": a turning coral star and a seconds counter, shown while the answer is on its way. */
function Working({ label, elapsed, from, duration }: { label: string; elapsed: number; from: number; duration: number }) {
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    let raf = 0
    const t0 = performance.now() + from * 1000
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - t0) / (duration * 1000)))
      setSecs(Math.round(p * elapsed))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [elapsed, from, duration])
  return (
    <motion.p
      className="absolute left-0 top-0 m-0 grid grid-cols-[1.5em_minmax(0,1fr)] text-fg-soft"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration, times: [0, 0.1, 0.9, 1], delay: from }}
      aria-hidden="true"
    >
      <motion.span className="inline-block w-[1em] text-center text-coral" animate={{ rotate: 360 }} transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}>
        ✻
      </motion.span>
      <span>
        <span className="text-coral">{label}…</span> ({secs}s · esc to interrupt)
      </span>
    </motion.p>
  )
}

/** Total seconds for one exchange to play out (for auto-advance timing). */
export const exchangeDuration = (x: TerminalExchange) => STEP.prompt + (x.workFor ?? 1.2) + (x.tool ? STEP.tool + 0.2 : 0) + STEP.answer
