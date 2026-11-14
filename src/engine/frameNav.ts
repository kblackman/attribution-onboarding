import type { MouseEvent } from 'react'

/*
  Header and end-of-story links that hand off to the Framer page around the deck.
  - View All Work (and the logo) go through Framer's own router, so its page transition plays (Kyle, 2026-11-05).
  - Get In Touch opens the contact modal Kyle built in Framer, like every other page on the site (Kyle, 2026-11-14).
  Embedded in the Framer case study page, a plain target=_top link reloads the whole site (skipping the transition)
  or leaves for LinkedIn (skipping the modal). Instead the deck posts { type: 'bkmn:navigate', to } to the parent,
  with to 'home' or 'contact'. The Framer overrides (framer/withDeckNavigation.tsx) answer with
  { type: 'bkmn:navigate-ack', to } and click their own hidden Home link or hidden Get In Touch button.
  If no answer comes within ACK_MS (override not installed or not updated, or the deck opened on its own), the link
  falls back to a normal whole-window navigation to its href. Modified clicks (new tab, new window) are left to the browser.
*/
const ACK_MS = 400

export const NAV_MESSAGE = 'bkmn:navigate'
export const NAV_ACK = 'bkmn:navigate-ack'
export type FramerTarget = 'home' | 'contact'

const embedded = () => {
  try {
    return window.self !== window.top
  } catch {
    return true
  }
}

function viaFramer(to: FramerTarget, e: MouseEvent<HTMLAnchorElement>) {
  if (!embedded() || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  e.preventDefault()
  const link = e.currentTarget
  let done = false
  const onAck = (m: MessageEvent) => {
    // an ack without `to` comes from the first version of the override, which only handled home
    if (m.source !== window.parent || m.data?.type !== NAV_ACK || (m.data.to ?? 'home') !== to) return
    done = true
    window.removeEventListener('message', onAck)
  }
  window.addEventListener('message', onAck)
  // nothing private in the message, so any parent may read it; the override checks where it came from
  window.parent.postMessage({ type: NAV_MESSAGE, to }, '*')
  window.setTimeout(() => {
    window.removeEventListener('message', onAck)
    if (done) return
    // fallback: the old behaviour, a whole-window navigation (still within the click's user activation)
    const a = document.createElement('a')
    a.href = link.href
    a.target = '_top'
    a.rel = link.rel
    a.click()
  }, ACK_MS)
}

export const navigateViaFramer = (e: MouseEvent<HTMLAnchorElement>) => viaFramer('home', e)
export const contactViaFramer = (e: MouseEvent<HTMLAnchorElement>) => viaFramer('contact', e)
