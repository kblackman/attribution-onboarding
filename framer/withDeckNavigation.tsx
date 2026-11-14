// Framer Code Overrides for the Attribution Onboarding case study page.
// The embedded deck asks this page to act for it, so the site behaves the same as every other page:
// - withDeckNavigation: "View All Work" (and the logo) navigate home through Framer, so the page transition plays.
// - withDeckContact: "Get In Touch" opens the site's contact modal.
// Each override goes on a hidden layer that already does the job when clicked (for contact, a copy of the site
// header, since the modal is wired to the header rather than the button). Setup steps: framer/README.md.

import type { ComponentType } from "react"
import { useEffect, useRef } from "react"

// Where the deck is hosted. Messages from anywhere else are ignored.
const DECK_ORIGIN = "https://kblackman.github.io"

// Framer's tap interactions (like opening an overlay) listen for pointer events, links listen for click,
// so a full press is sent: pointer down, pointer up, then click.
function press(el: HTMLElement) {
    const opts = { bubbles: true, cancelable: true, composed: true, pointerId: 1, pointerType: "mouse", isPrimary: true, button: 0 }
    el.dispatchEvent(new PointerEvent("pointerdown", { ...opts, buttons: 1 }))
    el.dispatchEvent(new PointerEvent("pointerup", { ...opts, buttons: 0 }))
    el.click()
}

// the innermost element reading "Get In Touch", then its nearest link or button (where Framer puts the tap)
function findContact(wrapper: HTMLElement | null): HTMLElement | null {
    if (!wrapper) return null
    const label = Array.from(wrapper.querySelectorAll<HTMLElement>("*"))
        .reverse()
        .find((el) => /^\s*get in touch\s*$/i.test(el.textContent ?? ""))
    return (label?.closest("a, button") as HTMLElement | null) ?? label ?? (wrapper.firstElementChild as HTMLElement | null)
}

/** Wraps a hidden layer; when the deck sends `to`, answers it and presses that layer. */
function deckTarget(to: "home" | "contact", Component): ComponentType {
    return (props) => {
        const ref = useRef<HTMLDivElement>(null)

        useEffect(() => {
            // the layer is only for the deck to trigger: keep it and anything inside it out of the tab order,
            // and let the mouse pass through it, so an invisible layer never blocks the deck underneath
            ref.current?.querySelectorAll("a, button, [tabindex]").forEach((el) => el.setAttribute("tabindex", "-1"))
            Array.from(ref.current?.children ?? []).forEach((el) => ((el as HTMLElement).style.pointerEvents = "none"))

            const onMessage = (event: MessageEvent) => {
                if (event.origin !== DECK_ORIGIN) return
                if (event.data?.type !== "bkmn:navigate" || event.data?.to !== to) return
                const wrapper = ref.current
                // home: the link itself. contact: the Get In Touch button inside the layer (the layer can be a whole
                // copy of the site header, where the modal is wired), else the layer itself
                const target = (to === "home" ? wrapper?.querySelector("a") : findContact(wrapper)) as HTMLElement | null
                if (!target) return // no ack: the deck falls back to a normal page load
                ;(event.source as Window | null)?.postMessage({ type: "bkmn:navigate-ack", to }, event.origin)
                // home keeps the plain click that's proven on the live site
                if (to === "home") target.click()
                else press(target)
            }
            window.addEventListener("message", onMessage)
            return () => window.removeEventListener("message", onMessage)
        }, [])

        return (
            <div ref={ref} aria-hidden="true" style={{ display: "contents" }}>
                <Component {...props} />
            </div>
        )
    }
}

export function withDeckNavigation(Component): ComponentType {
    return deckTarget("home", Component)
}

export function withDeckContact(Component): ComponentType {
    return deckTarget("contact", Component)
}
