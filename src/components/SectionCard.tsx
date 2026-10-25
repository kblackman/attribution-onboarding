import type { Beat } from '../engine/types'
import { SECTIONS, getSection, sectionNumber } from '../sections'
import { Reveal } from './Reveal'

/**
 * Opens a section. Usage in src/beats/index.ts: `sectionCard('discovery')`.
 * Everything shown (number, label, tagline, motif) comes from src/sections.ts.
 */
export function sectionCard(id: string): Beat {
  const s = getSection(id)
  const number = sectionNumber(id)
  return {
    slug: `section-${id}`,
    title: `${number} ${s.label}`,
    variant: 'section',
    sectionId: id,
    card: <SectionCardContent number={number} label={s.label} tagline={s.tagline} index={SECTIONS.findIndex((x) => x.id === id)} />,
  }
}

interface ContentProps {
  number: string
  label: string
  tagline?: string
  index: number
}

/**
 * After the section title cards in the Tiled feature pitch deck: the pie motif (one wedge per section,
 * earlier ones dimmed, this one lit), an accent rule with the number, the label at hero size, and the
 * tagline. Set apart from story cards by the accent border and a giant outlined numeral off the corner.
 */
function SectionCardContent({ number, label, tagline, index }: ContentProps) {
  return (
    <>
      {/* clipped in its own layer, so it bleeds off the corner without making the card scroll on phones */}
      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
      <span
        className="absolute bottom-[-0.22em] right-[-0.04em] select-none text-[clamp(180px,calc(var(--u)*30),560px)] font-extrabold leading-none tracking-[-0.06em] text-transparent [-webkit-text-stroke:1.5px_color-mix(in_srgb,var(--color-accent)_38%,transparent)]"
      >
        {number}
      </span>
      </span>
      <div className="relative">
        <Reveal order={1}>
          <SectionMotif index={index} total={SECTIONS.length} />
        </Reveal>
        <Reveal order={1} className="mb-[clamp(16px,calc(var(--u)*1.8),30px)] flex items-center gap-[14px] text-label uppercase text-accent">
          <i className="block h-0.5 w-[34px] bg-accent" aria-hidden="true" />
          <span>{number}</span>
        </Reveal>
        <Reveal as="h2" order={2} className="m-0 text-display font-extrabold">
          {label}
        </Reveal>
        {tagline && (
          <Reveal as="p" order={3} className="m-0 mt-[clamp(18px,calc(var(--u)*2.2),34px)] max-w-[40ch] text-lead text-fg-muted text-pretty">
            {tagline}
          </Reveal>
        )}
      </div>
    </>
  )
}

/** The deck's pie motif: one wedge per section, earlier sections dimmed, the current one lit. */
function SectionMotif({ index, total }: { index: number; total: number }) {
  const wedge = (i: number) => {
    const a0 = (i / total) * 2 * Math.PI - Math.PI / 2
    const a1 = ((i + 1) / total) * 2 * Math.PI - Math.PI / 2
    const p = (a: number) => `${(60 + 44 * Math.cos(a)).toFixed(2)} ${(60 + 44 * Math.sin(a)).toFixed(2)}`
    return `M60 60L${p(a0)}A44 44 0 0 1 ${p(a1)}Z`
  }
  return (
    <svg viewBox="0 0 120 120" className="mb-[clamp(26px,calc(var(--u)*3),52px)] block h-auto w-[clamp(64px,calc(var(--u)*7.4),132px)] overflow-visible" aria-hidden="true">
      <circle cx="60" cy="60" r="44" fill="none" stroke="var(--color-hairline-strong)" strokeWidth="1" />
      {Array.from({ length: index + 1 }, (_, i) => (
        <path key={i} d={wedge(i)} fill="var(--color-accent)" opacity={i === index ? 1 : 0.2} />
      ))}
    </svg>
  )
}
