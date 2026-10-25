/*
  The case study's sections. Temporary and expected to change: rename, reword, or reorder here and
  everything follows. Numbers come from order (the first numbered section is 01), so nothing else
  hardcodes them. The prologue has no section card.

  To open a section in the presentation, add `sectionCard('<id>')` to src/beats/index.ts.
  Every beat after a section card belongs to that section until the next one.
*/
export interface Section {
  id: string
  label: string
  tagline?: string
}

export const PROLOGUE: Section = { id: 'prologue', label: 'Prologue' }

export const SECTIONS: Section[] = [
  { id: 'discovery', label: 'Discovery', tagline: 'From a hunch to a pattern.' },
  { id: 'diagnosis', label: 'Diagnosis', tagline: 'Mapping the flow to see the shape of the problem.' },
  { id: 'approach', label: 'Approach', tagline: 'Scoping, reusing, and testing.' },
  { id: 'solution', label: 'Solution', tagline: 'A guided setup flow framework, reusable for every feature after it.' },
  { id: 'impact', label: 'Impact', tagline: 'What changed, and what the team kept using.' },
]

/** "01", "02", ... from a section's position. */
export const sectionNumber = (id: string) => String(SECTIONS.findIndex((s) => s.id === id) + 1).padStart(2, '0')

export function getSection(id: string): Section {
  const s = SECTIONS.find((x) => x.id === id)
  if (!s) throw new Error(`Unknown section "${id}". Sections live in src/sections.ts.`)
  return s
}
