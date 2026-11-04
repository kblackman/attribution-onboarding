import { useSyncExternalStore } from 'react'

/*
  Autoplay for multi-step visuals (walkthroughs that move on by themselves). On by default. In the portfolio
  edition the reader can pause it (the Pause control, P, or stepping Back) and resume it; App resets it to on
  whenever a new beat starts. In the presentation edition nothing pauses it, so visuals behave as before.
*/
let on = true
const listeners = new Set<() => void>()

export function setAutoplay(value: boolean) {
  if (value === on) return
  on = value
  listeners.forEach((l) => l())
}

export function useAutoplay(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => on,
  )
}
