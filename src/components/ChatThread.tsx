import { useContext } from 'react'
import { motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'
import { usePrefersReducedMotion } from '../engine/reducedMotion'
import { RevealContext } from './Reveal'

export interface ChatMessage {
  /** Who posted: a role ("PM", "Eng") for teammates, or a name. */
  author: string
  text: string
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
  className?: string
}

/** "Kyle Blackman" becomes "KB"; a single word keeps its first two letters ("PM", "En"). */
const initials = (author: string) => {
  const words = author.trim().split(/\s+/)
  return words.length > 1 ? (words[0][0] + words[words.length - 1][0]).toUpperCase() : author.slice(0, 2)
}

/**
 * A generic team chat thread (channel header, avatars, roles, timestamps, reactions). Deliberately not
 * any real product's look. Messages arrive one at a time when the card it sits in reveals, and are
 * simply shown under reduced motion. Evidence tier: use inside a card.
 */
export function ChatThread({ channel, messages, start = 0.4, stagger = 1.1, placeholderNote, className = '' }: ChatThreadProps) {
  const { revealed, lead } = useContext(RevealContext)
  const reduce = usePrefersReducedMotion()

  return (
    <figure className={`m-0 flex flex-col gap-2 ${className}`}>
      <div className="overflow-hidden rounded-[14px] border border-hairline bg-card-to text-[clamp(12px,calc(var(--u)*1.02),17px)] leading-[1.4]">
        <div className="flex items-center gap-2 border-b border-hairline px-[1.1em] py-[0.8em]">
          <span className="font-bold text-fg">
            <span className="mr-[0.15em] text-fg-soft" aria-hidden="true">#</span>
            {channel}
          </span>
        </div>
        <ol className="m-0 flex list-none flex-col gap-[0.9em] p-[1.1em]" aria-label={`Messages in #${channel}`}>
          {messages.map((m, i) => (
            <motion.li
              key={i}
              className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-[0.75em]"
              initial={false}
              animate={revealed ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: reduce ? 0 : 10, filter: reduce ? 'blur(0px)' : 'blur(4px)' }}
              transition={
                !revealed
                  ? { duration: 0 }
                  : reduce
                    ? { duration: 0.3 }
                    : { duration: 0.6, delay: lead + start + i * stagger, ease: EASE_DECK }
              }
            >
              <span
                className="row-span-3 grid h-[2.2em] w-[2.2em] place-items-center rounded-[0.5em] bg-white/[0.1] text-[0.78em] font-bold text-fg-muted"
                aria-hidden="true"
              >
                {initials(m.author)}
              </span>
              <span className="flex items-baseline gap-[0.6em]">
                <b className="font-bold text-fg">{m.author}</b>
                {m.time && <span className="text-[0.82em] text-fg-soft">{m.time}</span>}
              </span>
              <span className="text-fg-muted">{m.text}</span>
              {m.reactions && (
                <span className="mt-[0.4em] flex gap-[0.4em]">
                  {m.reactions.map((r) => (
                    <span key={r.emoji} className="rounded-full border border-hairline-strong px-[0.55em] py-[0.1em] text-[0.82em] text-fg-muted">
                      <span aria-hidden="true">{r.emoji}</span> {r.count}
                    </span>
                  ))}
                </span>
              )}
            </motion.li>
          ))}
        </ol>
      </div>
      {placeholderNote && <figcaption className="text-[clamp(11px,calc(var(--u)*0.85),14px)] text-fg-soft">{placeholderNote}</figcaption>}
    </figure>
  )
}
