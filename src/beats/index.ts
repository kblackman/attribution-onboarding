import type { Beat } from '../engine/types'
import title from './01-title'
import problem from './02-problem'
import pattern from './03-pattern'
import hunch from './04-hunch'
import widespread from './05-widespread'
import dots from './06-dots'
import checking from './07-checking'
import oneProblem from './08-one-problem'
import beforePrototyping from './09-before-prototyping'
import codeTold from './10-code-told'
import realNumbers from './11-real-numbers'
import twoMoments from './12-two-moments'
import showingWork from './13-showing-work'
import toTheTeam from './14-to-the-team'
import setupFlow from './15-setup-flow'
import threeGoals from './16-three-goals'
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
  sectionCard('diagnosis'),
  dots,
  checking,
  oneProblem,
  sectionCard('approach'),
  beforePrototyping,
  codeTold,
  realNumbers,
  twoMoments,
  showingWork,
  toTheTeam,
  sectionCard('solution'),
  setupFlow,
  threeGoals,
]
