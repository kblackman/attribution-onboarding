// Framer Code Override for the Attribution Onboarding case study page.
// Lets the embedded deck's "View All Work" links navigate through Framer, so the page transition plays.
// Setup steps: framer/README.md.

import type { ComponentType } from "react"
import { useEffect, useRef } from "react"

// Where the deck is hosted. Messages from anywhere else are ignored.
const DECK_ORIGIN = "https://kblackman.github.io"

export function withDeckNavigation(Component): ComponentType {
    return (props) => {
        const ref = useRef<HTMLDivElement>(null)

        useEffect(() => {
            const wrapper = ref.current
            const link = wrapper?.querySelector("a")
            // the link is only for the deck to trigger: keep it out of the tab order
            link?.setAttribute("tabindex", "-1")

            const onMessage = (event: MessageEvent) => {
                if (event.origin !== DECK_ORIGIN) return
                if (event.data?.type !== "bkmn:navigate" || event.data?.to !== "home") return
                const target = ref.current?.querySelector("a")
                if (!target) return // no ack: the deck falls back to a normal page load
                ;(event.source as Window | null)?.postMessage({ type: "bkmn:navigate-ack" }, event.origin)
                target.click()
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
