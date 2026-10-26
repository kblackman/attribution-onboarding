import { useSyncExternalStore } from 'react'

/*
  Present mode: Kyle's live-talk switch. T toggles it (no visible control); ?present in the URL starts in it.
  While on, beats that define a TLDR show it instead of their full copy, set larger. Full copy stays the
  default for portfolio readers. Remembered per browser, so a reload mid-talk keeps it.
*/
const KEY = 'present-mode'

function initial(): boolean {
  if (typeof location !== 'undefined' && new URLSearchParams(location.search).has('present')) return true
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

let on = initial()
const listeners = new Set<() => void>()

export function togglePresentMode() {
  on = !on
  try {
    localStorage.setItem(KEY, on ? '1' : '0')
  } catch {
    // storage unavailable: the mode still works for this visit
  }
  listeners.forEach((l) => l())
}

export function usePresentMode(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => on,
  )
}
