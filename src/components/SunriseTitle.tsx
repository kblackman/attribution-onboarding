import { useContext, useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'
import { usePrefersReducedMotion } from '../engine/reducedMotion'
import { RevealContext } from './Reveal'

/*
  Section title sequence, "sunrise" version (Kyle, 2026-11-04). The amber horizon draws out wide (strong
  amber in the middle, fading to the background at both ends). Everything above it is sky, clipped at the
  horizon, so things rise over it rather than fade in: first the giant outlined numeral (slowest, far
  behind), then an amber sun glow, then the word. The word comes up as a dark silhouette with a warm rim,
  backlit by the sun, and brightens to white as it clears. Then the horizon pulls back to the motif's usual
  length, and the tagline lands. The sun and the light along the line build from the first moment, so
  nothing new lights up at the end. Below the line the glow fades out softly instead of stopping at a hard edge.
  Plays once per visit; stepping back in shows it settled. Reduced motion: everything fades in together.
  Tune here (seconds from the start of the sequence; positions in percent of each element's own height).
*/
export const TIMING = {
  start: 0.15, // after the previous step has started clearing
  line: 0, // horizon draws out from the center
  lineDur: 1.1,
  numeral: 0.2, // giant numeral rises, slowest
  numeralDur: 3.4,
  numeralRest: '24%', // how far the numeral stays sunk below the horizon at rest
  sun: 0.1, // sun glow rises from the moment the line draws, done as the word clears
  sunDur: 2.5,
  bloomDur: 1.2, // the light along the horizon, with the line
  word: 0.6, // the word rises over the horizon
  wordDur: 2.0,
  light: 1.5, // the word brightens from silhouette to white
  lightDur: 1.2,
  rimOff: 2.5, // the warm rim fades once the word is lit
  rimDur: 0.8,
  settle: 2.6, // horizon pulls back to its usual length
  settleDur: 1.5, // eased in and out, so the horizon visibly draws back rather than snapping
  tagline: 2.9,
  reducedFade: 0.5,
}

const WIDE = 0.9 // horizon width while the title rises, as a share of the screen width
const settledWidth = (vw: number) => Math.min(vw * 0.56, 720) // the motif's usual length (HorizonLine on overlays)

function useViewportWidth() {
  const [vw, setVw] = useState(() => (typeof window === 'undefined' ? 1440 : window.innerWidth))
  useEffect(() => {
    const on = () => setVw(window.innerWidth)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return vw
}

interface Props {
  number: string
  label: string
  tagline?: string
  /** Position among the sections (unused here since the chapter row was dropped; kept for the classic version). */
  index: number
}

export function SunriseTitle({ number, label, tagline }: Props) {
  const { revealed, lead } = useContext(RevealContext)
  const reduce = usePrefersReducedMotion()
  const vw = useViewportWidth()
  const t0 = lead + TIMING.start
  const settle = settledWidth(vw) / (vw * WIDE)

  const stage = (at: number, dur: number) =>
    !revealed ? { duration: 0 } : reduce ? { duration: TIMING.reducedFade } : { duration: dur, delay: t0 + at, ease: EASE_DECK }
  const rimTotal = TIMING.rimOff + TIMING.rimDur - TIMING.word

  return (
    <>
      {/* darkness: the edges fall away into the card shade */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 70% 65% at 50% 50%, transparent 35%, var(--color-card-to) 100%)' }}
        aria-hidden="true"
      />

      <div className="relative flex w-full flex-col items-center text-center">
        <div className="relative flex w-full flex-col items-center">
        {/* the sun: an amber glow that climbs behind the word. Not clipped like the sky: below the horizon it
            fades out over FADE, so there is no hard shelf where it meets the line */}
        <div
          className="pointer-events-none absolute bottom-[calc(-1*var(--fade))] left-1/2 h-[calc(min(70vh,1100px)+var(--fade))] w-[min(90vw,1500px)] -translate-x-1/2 [--fade:9vh]"
          style={{ maskImage: 'linear-gradient(to bottom, #000 calc(100% - var(--fade)), transparent)', WebkitMaskImage: 'linear-gradient(to bottom, #000 calc(100% - var(--fade)), transparent)' }}
          aria-hidden="true"
        >
          <motion.div
            className="absolute inset-x-0 bottom-[var(--fade)] h-[min(70vh,1100px)]"
            style={{
              background:
                'radial-gradient(closest-side, color-mix(in srgb, var(--color-accent) 30%, transparent), color-mix(in srgb, var(--color-accent) 9%, transparent) 55%, transparent)',
            }}
            initial={false}
            animate={revealed ? { y: '38%', opacity: 1 } : { y: reduce ? '38%' : '72%', opacity: 0 }}
            transition={stage(TIMING.sun, TIMING.sunDur)}
          />
        </div>

        {/* the sky: everything above the horizon. Clipped only at the bottom edge, so things rise over the line */}
        <div className="relative flex justify-center px-6" style={{ clipPath: 'inset(-100vh -100vw 0 -100vw)' }}>
          {/* giant outlined numeral, far behind, rising slowest and staying partly sunk */}
          <motion.span
            className="pointer-events-none absolute bottom-0 left-1/2 select-none text-[clamp(300px,calc(var(--u)*58),1100px)] font-extrabold leading-[0.8] tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_color-mix(in_srgb,var(--color-accent)_18%,transparent)]"
            style={{ x: '-50%' }}
            aria-hidden="true"
            initial={false}
            animate={revealed ? { y: TIMING.numeralRest, opacity: 1 } : { y: reduce ? TIMING.numeralRest : '100%', opacity: reduce ? 0 : 1 }}
            transition={stage(TIMING.numeral, TIMING.numeralDur)}
          >
            {number}
          </motion.span>


          {/* the word: rises from below the horizon. pb leaves room for descenders above the line */}
          <h2 className="relative m-0 pb-[0.16em] text-[clamp(56px,calc(var(--u)*13),260px)] font-extrabold leading-[0.95] tracking-[-0.045em]">
            <span className="sr-only">{label}</span>
            <motion.span
              aria-hidden="true"
              className="relative block"
              initial={false}
              animate={{ y: revealed || reduce ? '0%' : '115%' }}
              transition={stage(TIMING.word, TIMING.wordDur)}
            >
              {/* backlit silhouette with a warm rim, under the lit word */}
              <motion.span
                className="block text-card-to [text-shadow:0_-0.02em_0.04em_color-mix(in_srgb,var(--color-accent)_70%,transparent),0_0_0.22em_color-mix(in_srgb,var(--color-accent)_35%,transparent)]"
                initial={false}
                animate={{ opacity: revealed && !reduce ? [1, 1, 0] : 0 }}
                transition={!revealed || reduce ? { duration: 0 } : { duration: rimTotal, delay: t0 + TIMING.word, times: [0, (TIMING.rimOff - TIMING.word) / rimTotal, 1], ease: 'easeOut' }}
              >
                {label}
              </motion.span>
              <motion.span
                className="absolute inset-0 block text-fg"
                initial={false}
                animate={{ opacity: revealed ? 1 : 0 }}
                transition={stage(TIMING.light, TIMING.lightDur)}
              >
                {label}
              </motion.span>
            </motion.span>
          </h2>
        </div>

        {/* the horizon: wide while the title rises, then back to its usual length; brightest in the middle */}
        <div className="relative h-[2px]" style={{ width: `${WIDE * 100}vw` }} aria-hidden="true">
          {/* two nested layers, one per move: the outer draws the line out wide, the inner later draws it back */}
          <motion.div
            className="absolute inset-0 origin-center"
            initial={false}
            animate={revealed ? { scaleX: 1, opacity: 1 } : { scaleX: reduce ? 1 : 0, opacity: 0 }}
            transition={stage(TIMING.line, TIMING.lineDur)}
          >
            <motion.div
              className="absolute inset-0 origin-center"
              style={{ background: 'linear-gradient(90deg, transparent, var(--color-accent) 38%, var(--color-accent) 62%, transparent)' }}
              initial={false}
              animate={{ scaleX: revealed || reduce ? settle : 1 }}
              transition={!revealed ? { duration: 0 } : reduce ? { duration: 0 } : { duration: TIMING.settleDur, delay: t0 + TIMING.settle, ease: 'easeInOut' }}
            />
          </motion.div>
          {/* the light along the horizon: fixed at the settled length, so it doesn't squeeze brighter when the line pulls back */}
          <motion.div
            className="absolute left-1/2 top-1/2 h-[44px] -translate-x-1/2 -translate-y-1/2"
            style={{ width: settledWidth(vw) * 1.3, background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-accent) 34%, transparent), transparent)' }}
            initial={false}
            animate={{ opacity: revealed ? 1 : 0 }}
            transition={stage(TIMING.line, TIMING.bloomDur)}
          />
        </div>
        </div>

        <div className="flex flex-col items-center px-6">
          {tagline && (
            <motion.p
              className="m-0 mt-[clamp(20px,calc(var(--u)*2.6),44px)] max-w-[40ch] text-lead text-fg-muted text-balance"
              initial={false}
              animate={revealed ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: reduce ? 0 : 12, filter: reduce ? 'blur(0px)' : 'blur(6px)' }}
              transition={stage(TIMING.tagline, 1)}
            >
              {tagline}
            </motion.p>
          )}

        </div>
      </div>
    </>
  )
}
