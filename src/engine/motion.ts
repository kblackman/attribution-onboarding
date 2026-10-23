import type { Transition, Variants } from 'motion/react'

// Deck curve and timing (tiled-whats-next template.html). Everything else is tuned to sit beside it.
export const EASE_DECK = [0.16, 0.84, 0.34, 1] as const
export const DUR = {
  card: 0.9, // deck card rise / recede
  visualIn: 0.9,
  visualOut: 0.7,
  overlay: 0.6,
  reveal: 1.15, // deck content reveal
  revealStep: 0.28, // deck data-delay step
  revealLead: 0.45, // deck: content starts 450ms after a card begins to land
  reduced: 0.3, // crossfade used for every transition under reduced motion
  statementLead: 0.3, // statement text waits for the outgoing visual to clear
} as const

const deck = (duration: number, delay = 0): Transition => ({ duration, delay, ease: EASE_DECK })
const fade: Transition = { duration: DUR.reduced, ease: 'easeOut' }

/*
  Card states.
  below:  waiting under the fold (deck: translate3d(0, 110vh, 0)).
  active: in place.
  behind: deck recede, kept visible behind the next card (card followed by card).
  gone:   deck recede plus a fade to 0, used when a full-screen visual takes over.
  Brightness from the deck's recede is omitted: motion here is transform, opacity, and blur only.
*/
export const cardVariants: Variants = {
  below: { y: '110vh', scale: 1, opacity: 1, filter: 'blur(0px)', transition: deck(DUR.card) },
  active: { y: 0, scale: 1, opacity: 1, filter: 'blur(0px)', transition: deck(DUR.card) },
  behind: { y: '-2.4vh', scale: 0.92, opacity: 0.64, filter: 'blur(1.6px)', transition: deck(DUR.card) },
  gone: { y: '-2.4vh', scale: 0.92, opacity: 0, filter: 'blur(1.6px)', transition: deck(DUR.card) },
}
export const cardVariantsReduced: Variants = {
  below: { y: 0, scale: 1, opacity: 0, filter: 'blur(0px)', transition: fade },
  active: { y: 0, scale: 1, opacity: 1, filter: 'blur(0px)', transition: fade },
  behind: { y: 0, scale: 1, opacity: 0, filter: 'blur(0px)', transition: fade },
  gone: { y: 0, scale: 1, opacity: 0, filter: 'blur(0px)', transition: fade },
}

/*
  Statement states. With no container to carry it, a statement arrives as a fade and lets its
  text do the rising (Reveal), then leaves with the same recede as a card.
*/
export const statementVariants: Variants = {
  below: { y: 0, scale: 1, opacity: 0, filter: 'blur(0px)', transition: { duration: DUR.reduced, ease: 'easeOut' } },
  active: { y: 0, scale: 1, opacity: 1, filter: 'blur(0px)', transition: deck(DUR.card) },
  behind: { y: '-2.4vh', scale: 0.92, opacity: 0, filter: 'blur(1.6px)', transition: deck(DUR.card) },
  gone: { y: '-2.4vh', scale: 0.92, opacity: 0, filter: 'blur(1.6px)', transition: deck(DUR.card) },
}

/*
  Hero states, from the decks' title screen: it recedes into depth (translate3d(0,0,-320px)),
  blurs 7px, and drops to 0.1 opacity. Brightness is omitted, as on cards.
*/
export const heroVariants: Variants = {
  below: { z: 0, opacity: 0, filter: 'blur(0px)', transition: fade },
  active: { z: 0, opacity: 1, filter: 'blur(0px)', transition: deck(DUR.card) },
  behind: { z: -320, opacity: 0.1, filter: 'blur(7px)', transition: deck(DUR.card) },
  // gone fades fully: with frameless statements after it, a 0.1 ghost would show through the text
  gone: { z: -320, opacity: 0, filter: 'blur(7px)', transition: deck(DUR.card) },
}

/*
  Full-screen visual states. It rises in from slightly larger and soft, as the card recedes,
  and leaves the same way it arrived (pre) or settles back and away (post).
  dimmed: sits behind an overlay, blurred.
*/
export const visualVariants: Variants = {
  pre: { opacity: 0, scale: 1.04, filter: 'blur(10px)', transition: deck(DUR.visualOut) },
  active: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: deck(DUR.visualIn, 0.18) },
  dimmed: { opacity: 1, scale: 1.02, filter: 'blur(14px)', transition: deck(DUR.overlay) },
  post: { opacity: 0, scale: 0.96, filter: 'blur(10px)', transition: deck(DUR.visualOut) },
}
export const visualVariantsReduced: Variants = {
  pre: { opacity: 0, scale: 1, filter: 'blur(0px)', transition: fade },
  active: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: fade },
  // the overlay still needs to separate from the visual, so keep the blur but don't animate it
  dimmed: { opacity: 1, scale: 1, filter: 'blur(14px)', transition: { duration: 0 } },
  post: { opacity: 0, scale: 1, filter: 'blur(0px)', transition: fade },
}

export const overlayVariants: Variants = {
  hidden: { opacity: 0, transition: deck(DUR.overlay) },
  shown: { opacity: 1, transition: deck(DUR.overlay) },
}
export const overlayTextVariants: Variants = {
  hidden: { opacity: 0, y: 18, transition: deck(DUR.overlay) },
  shown: { opacity: 1, y: 0, transition: deck(DUR.reveal, 0.2) },
}
export const overlayTextVariantsReduced: Variants = {
  hidden: { opacity: 0, y: 0, transition: fade },
  shown: { opacity: 1, y: 0, transition: fade },
}
