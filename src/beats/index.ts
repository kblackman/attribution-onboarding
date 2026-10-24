import type { Beat } from '../engine/types'
import title from './01-title'
import problem from './02-problem'
import pattern from './03-pattern'

// The presentation, in order. Adding a beat: add its file in this folder, then one line here.
export const beats: Beat[] = [
  title,
  problem,
  pattern,
]
