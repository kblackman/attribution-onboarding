import type { MouseEvent } from 'react'

/*
  View All Work through Framer's own router, so its page transition plays (Kyle, 2026-11-05).
  Embedded in the Framer case study page, a plain target=_top link reloads the whole site and skips Framer's
  transition. Instead the deck asks the Framer page to navigate: it posts { type: 'bkmn:navigate', to: 'home' }
  to the parent, and the withDeckNavigation override on the Framer page (framer/withDeckNavigation.tsx) answers
  with 'bkmn:navigate-ack' and clicks its own hidden Home link. If no answer comes within ACK_MS (override not
  installed, or the deck opened on its own), the link falls back to a normal whole-window navigation.
  Modified clicks (new tab, new window) are left to the browser.
*/
const ACK_MS = 400

export const NAV_MESSAGE = 'bkmn:navigate'
export const NAV_ACK = 'bkmn:navigate-ack'

const embedded = () => {
  try {
    return window.self !== window.top
  } catch {
    return true
  }
}

export function navigateViaFramer(e: MouseEvent<HTMLAnchorElement>) {
  if (!embedded() || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  e.preventDefault()
  const link = e.currentTarget
  let done = false
  const onAck = (m: MessageEvent) => {
    if (m.source !== window.parent || m.data?.type !== NAV_ACK) return
    done = true
    window.removeEventListener('message', onAck)
  }
  window.addEventListener('message', onAck)
  // nothing private in the message, so any parent may read it; the override checks where it came from
  window.parent.postMessage({ type: NAV_MESSAGE, to: 'home' }, '*')
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
