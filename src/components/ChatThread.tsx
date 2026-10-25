import { useContext, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'
import { usePrefersReducedMotion } from '../engine/reducedMotion'
import { RevealContext } from './Reveal'

export interface ChatMessage {
  /** Who posted: a role ("PM", "Eng") for teammates, or a name. */
  author: string
  /** Plain text, or rich text (e.g. a bold lead-in). */
  text: ReactNode
  time?: string
  reactions?: { emoji: string; count: number }[]
}

interface ChatThreadProps {
  channel: string
  messages: ChatMessage[]
  /** Seconds after the card's content starts revealing before the first message lands. */
  start?: number
  /** Seconds between messages. */
  stagger?: number
  /** Small note under the thread while the wording is a placeholder. Omit once it's real. */
  placeholderNote?: string
  /** A date divider above the messages, as chat apps show (e.g. "After the research sessions"). */
  divider?: string
  /**
   * Earlier messages, shown dimmed above the divider and present from the start (a callback to an earlier
   * thread). Only `messages` animate in.
   */
  earlier?: ChatMessage[]
  /** 'card' to sit inside a card; 'large' for a full-screen visual. */
  size?: 'card' | 'large'
  /** Tighter spacing between messages, for long threads inside a card. */
  compact?: boolean
  /**
   * Drive it directly instead of from the card it sits in (full-screen visuals): shown starts the messages,
   * instant shows them all at once (stepping back in). Delays then count from when shown turns true.
   */
  shown?: boolean
  instant?: boolean
  className?: string
}

/** "Kyle Blackman" becomes "KB"; a single word keeps its first two letters ("PM", "En"). */
const initials = (author: string) => {
  const words = author.trim().split(/\s+/)
  return words.length > 1 ? (words[0][0] + words[words.length - 1][0]).toUpperCase() : author.slice(0, 2)
}

/**
 * A generic team chat thread (channel header, avatars, roles, timestamps, reactions). Deliberately not
 * any real product's look. Messages arrive one at a time, and are simply shown under reduced motion.
 * Evidence tier: inside a card (size 'card'), or as a full-screen visual (size 'large', driven by shown).
 */
export function ChatThread({ channel, messages, start = 0.4, stagger = 1.1, placeholderNote, divider, earlier, size = 'card', compact = false, shown, instant = false, className = '' }: ChatThreadProps) {
  const ctx = useContext(RevealContext)
  const driven = shown !== undefined
  const revealed = driven ? shown : ctx.revealed
  const lead = driven ? 0 : ctx.lead
  const reduce = usePrefersReducedMotion()

  return (
    <figure className={`m-0 flex flex-col gap-2 ${className}`}>
      <div className={`overflow-hidden rounded-[14px] border border-hairline bg-card-to leading-[1.4] ${size === 'large' ? 'text-[clamp(14px,calc(var(--u)*1.55),27px)] shadow-[0_24px_60px_rgba(0,0,0,0.45)]' : 'text-[clamp(12px,calc(var(--u)*1.02),17px)]'}`}>
        <div className="flex items-center gap-2 border-b border-hairline px-[1.1em] py-[0.8em]">
          <span className="font-bold text-fg">
            <span className="mr-[0.15em] text-fg-soft" aria-hidden="true">#</span>
            {channel}
          </span>
        </div>
        {earlier && (
          <ol className={`m-0 flex list-none flex-col px-[1.1em] ${compact ? 'gap-[0.55em] pt-[0.8em]' : 'gap-[0.9em] pt-[1.1em]'}`} aria-label={`Earlier in #${channel}`}>
            {earlier.map((m, i) => (
              <li key={i} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-[0.75em]">
                <MessageBody m={m} dim />
              </li>
            ))}
          </ol>
        )}
        {divider && (
          <div className={`flex items-center gap-[0.8em] px-[1.1em] text-[0.8em] text-fg-soft ${compact ? 'pt-[0.6em]' : 'pt-[0.9em]'}`}>
            <span className="h-px flex-1 bg-hairline" aria-hidden="true" />
            <span>{divider}</span>
            <span className="h-px flex-1 bg-hairline" aria-hidden="true" />
          </div>
        )}
        <ol className={`m-0 flex list-none flex-col ${compact ? 'gap-[0.55em] px-[1.1em] py-[0.8em]' : 'gap-[0.9em] p-[1.1em]'}`} aria-label={`Messages in #${channel}`}>
          {messages.map((m, i) => (
            <motion.li
              key={i}
              className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-[0.75em]"
              initial={false}
              animate={revealed ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: reduce ? 0 : 10, filter: reduce ? 'blur(0px)' : 'blur(4px)' }}
              transition={
                !revealed || instant
                  ? { duration: 0 }
                  : reduce
                    ? { duration: 0.3 }
                    : { duration: 0.6, delay: lead + start + i * stagger, ease: EASE_DECK }
              }
            >
              <MessageBody m={m} />
            </motion.li>
          ))}
        </ol>
      </div>
      {placeholderNote && <figcaption className="text-[clamp(11px,calc(var(--u)*0.85),14px)] text-fg-soft">{placeholderNote}</figcaption>}
    </figure>
  )
}

/** One message: avatar, author and time, text, reactions. `dim` mutes it to the lowest AA text level (earlier messages). */
function MessageBody({ m, dim = false }: { m: ChatMessage; dim?: boolean }) {
  return (
    <>
      <span
        className={`row-span-3 grid h-[2.2em] w-[2.2em] place-items-center rounded-[0.5em] ${dim ? 'bg-white/[0.05]' : 'bg-white/[0.1]'} text-[0.78em] font-bold ${dim ? 'text-fg-soft' : 'text-fg-muted'}`}
        aria-hidden="true"
      >
        {initials(m.author)}
      </span>
      <span className="flex items-baseline gap-[0.6em]">
        <b className={`font-bold ${dim ? 'text-fg-soft' : 'text-fg'}`}>{m.author}</b>
        {m.time && <span className="text-[0.82em] text-fg-soft">{m.time}</span>}
      </span>
      <span className={dim ? 'text-fg-soft' : 'text-fg-muted'}>{m.text}</span>
      {m.reactions && (
        <span className="mt-[0.3em] flex gap-[0.4em]">
          {m.reactions.map((r) => (
            <span key={r.emoji} className="rounded-full border border-hairline-strong px-[0.55em] py-[0.1em] text-[0.82em] text-fg-muted">
              <span aria-hidden="true">{r.emoji}</span> {r.count}
            </span>
          ))}
        </span>
      )}
    </>
  )
}
