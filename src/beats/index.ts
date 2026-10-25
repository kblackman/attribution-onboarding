import type { Beat } from '../engine/types'
import title from './01-title'
import problem from './02-problem'
import pattern from './03-pattern'
import hunch from './04-hunch'
import widespread from './05-widespread'
import { sectionCard } from '../components/SectionCard'

// The presentation, in order. Adding a beat: add its file in this folder, then one line here.
// Open a section with sectionCard('<id>'); sections are defined in src/sections.ts.
export const beats: Beat[] = [
  title,
  problem,
  sectionCard('discovery'),
  pattern,
  hunch,
  widespread,
]
