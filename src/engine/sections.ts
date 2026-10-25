import type { Beat } from './types'
import { PROLOGUE, getSection, sectionNumber, type Section } from '../sections'

export interface BeatPlace {
  section: Section
  /** "01" for numbered sections, empty for the prologue. */
  number: string
  isSectionCard: boolean
  /** 1-based position among the section's beats (section card excluded), and how many there are. */
  pos: number
  count: number
}

/**
 * Where each beat sits: its section (by position after the last section card) and its place within it.
 * Nothing on a beat records this, so moving or renaming sections never touches beat files.
 */
export function placeBeats(beats: Beat[]): BeatPlace[] {
  const places: BeatPlace[] = []
  let section = PROLOGUE
  let number = ''
  let group: BeatPlace[] = []
  const close = () => group.forEach((p, i) => { p.pos = i + 1; p.count = group.length })
  for (const b of beats) {
    if (b.variant === 'section' && b.sectionId) {
      close()
      group = []
      section = getSection(b.sectionId)
      number = sectionNumber(b.sectionId)
      places.push({ section, number, isSectionCard: true, pos: 0, count: 0 })
      continue
    }
    const p: BeatPlace = { section, number, isSectionCard: false, pos: 0, count: 0 }
    group.push(p)
    places.push(p)
  }
  close()
  return places
}

/** Progress label, in the decks' format: "01 · 2/3", "01 · Discovery" on its section card, "Prologue · 1/2". */
export function placeLabel(p: BeatPlace): string {
  if (p.isSectionCard) return `${p.number} · ${p.section.label}`
  return `${p.number || p.section.label} · ${p.pos}/${p.count}`
}
