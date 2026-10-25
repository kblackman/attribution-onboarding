import { useContext } from 'react'
import { motion } from 'motion/react'
import type { Beat } from '../engine/types'
import { EASE_DECK } from '../engine/motion'
import { usePrefersReducedMotion } from '../engine/reducedMotion'
import { SECTIONS, getSection, sectionNumber } from '../sections'
import { RevealContext } from './Reveal'

/**
 * Opens a section. Usage in src/beats/index.ts: `sectionCard('discovery')`.
 * Everything shown (number, label, tagline, chapter row) comes from src/sections.ts.
 */
export function sectionCard(id: string): Beat {
  const s = getSection(id)
  const number = sectionNumber(id)
  return {
    slug: `section-${id}`,
    title: `${number} ${s.label}`,
    variant: 'section',
    sectionId: id,
    card: <SectionTitle number={number} label={s.label} tagline={s.tagline} index={SECTIONS.findIndex((x) => x.id === id)} />,
  }
}

/*
  A cinematic title sequence rather than a slide. From a dark, vignetted screen: a thin accent line draws
  out from the center like a horizon, the label rises letter by letter from behind it (sharpening as it
  clears), a warm glow blooms behind the word, and a giant outlined numeral settles far in the background.
  The number, tagline, and chapter row land last. Plays once per visit; stepping back in shows it settled.
  Tune here (seconds, from the moment the sequence starts).
*/
export const TIMING = {
  start: 0.15, // after the previous step has started clearing
  line: 0, // horizon line draws
  lineDur: 1.1,
  numeral: 0.1, // giant background numeral settles
  numeralDur: 4.5,
  glow: 0.5,
  glowDur: 2.2,
  number: 0.4, // small "01" above the word
  letters: 0.55, // first letter starts rising
  letterStagger: 0.05,
  letterDur: 1.1,
  afterWord: 0.4, // tagline, after the last letter has started
  chapters: 0.35, // chapter row, after the tagline
  reducedFade: 0.5, // reduced motion: everything fades in together
}

interface TitleProps {
  number: string
  label: string
  tagline?: string
  index: number
}

function SectionTitle({ number, label, tagline, index }: TitleProps) {
  const { revealed, lead } = useContext(RevealContext)
  const reduce = usePrefersReducedMotion()
  const t0 = lead + TIMING.start
  const letters = [...label]
  const taglineAt = TIMING.letters + letters.length * TIMING.letterStagger + TIMING.afterWord

  // one helper for every stage: hidden until revealed, then its own delay; reduced motion fades all at once
  const stage = (at: number, dur: number) =>
    !revealed ? { duration: 0 } : reduce ? { duration: TIMING.reducedFade } : { duration: dur, delay: t0 + at, ease: EASE_DECK }

  return (
    <>
      {/* darkness: the edges fall away into the card shade */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 70% 65% at 50% 50%, transparent 35%, var(--color-card-to) 100%)' }}
        aria-hidden="true"
      />

      {/* giant outlined numeral, far behind */}
      <motion.span
        className="pointer-events-none absolute select-none text-[clamp(300px,calc(var(--u)*58),1100px)] font-extrabold leading-none tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_color-mix(in_srgb,var(--color-accent)_16%,transparent)]"
        aria-hidden="true"
        initial={false}
        animate={revealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: reduce ? 1 : 1.08 }}
        transition={stage(TIMING.numeral, TIMING.numeralDur)}
      >
        {number}
      </motion.span>

      {/* warm glow behind the word */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[46vh] w-[70vw] -translate-x-1/2 -translate-y-1/2"
        style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-accent) 13%, transparent), transparent)' }}
        aria-hidden="true"
        initial={false}
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={stage(TIMING.glow, TIMING.glowDur)}
      />

      <div className="relative flex flex-col items-center px-6 text-center">
        <motion.span
          className="mb-[clamp(10px,calc(var(--u)*1.4),24px)] text-label uppercase text-accent"
          initial={false}
          animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: reduce ? 0 : 10 }}
          transition={stage(TIMING.number, 0.9)}
        >
          {number}
        </motion.span>

        {/* the word rises from behind the horizon line: its wrapper clips everything below the line */}
        <h2 className="m-0 overflow-hidden pb-[0.16em] text-[clamp(56px,calc(var(--u)*13),260px)] font-extrabold leading-[0.95] tracking-[-0.045em] text-fg">
          <span className="sr-only">{label}</span>
          <span aria-hidden="true" className="inline-flex">
            {letters.map((ch, i) => (
              <motion.span
                key={i}
                className="inline-block whitespace-pre"
                initial={false}
                animate={revealed ? { y: '0%', opacity: 1, filter: 'blur(0px)' } : { y: reduce ? '0%' : '110%', opacity: 0, filter: reduce ? 'blur(0px)' : 'blur(12px)' }}
                transition={stage(TIMING.letters + i * TIMING.letterStagger, TIMING.letterDur)}
              >
                {ch}
              </motion.span>
            ))}
          </span>
        </h2>

        <motion.span
          className="block h-px w-[min(56vw,720px)] origin-center bg-accent"
          aria-hidden="true"
          initial={false}
          animate={revealed ? { scaleX: 1, opacity: 1 } : { scaleX: reduce ? 1 : 0, opacity: 0 }}
          transition={stage(TIMING.line, TIMING.lineDur)}
        />

        {tagline && (
          <motion.p
            className="m-0 mt-[clamp(20px,calc(var(--u)*2.6),44px)] max-w-[40ch] text-lead text-fg-muted text-balance"
            initial={false}
            animate={revealed ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: reduce ? 0 : 12, filter: reduce ? 'blur(0px)' : 'blur(6px)' }}
            transition={stage(taglineAt, 1)}
          >
            {tagline}
          </motion.p>
        )}

        {/* chapter row: where this section sits in the case study */}
        <motion.div
          className="mt-[clamp(28px,calc(var(--u)*4.4),80px)] flex items-center gap-[clamp(14px,calc(var(--u)*1.8),28px)] text-label tabular-nums"
          initial={false}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={stage(taglineAt + TIMING.chapters, 0.9)}
        >
          <span className="sr-only">
            Section {index + 1} of {SECTIONS.length}
          </span>
          {SECTIONS.map((s, i) => (
            <span
              key={s.id}
              aria-hidden="true"
              className={`border-b pb-1 ${i === index ? 'border-accent text-accent' : 'border-transparent text-fg-soft'} ${i > index ? 'opacity-50' : ''}`}
            >
              {sectionNumber(s.id)}
            </span>
          ))}
        </motion.div>
      </div>
    </>
  )
}
