import type { ReactNode } from 'react'

/*
  Present mode's points (Kyle, 2026-10-26): each short line gets an amber dot. The dot is decorative (the list
  semantics carry the structure), sized and placed in em so it holds at any type size.
*/
const Dot = () => <span className="mt-[0.5em] block h-[0.34em] w-[0.34em] rounded-full bg-accent" aria-hidden="true" />

export function BulletList({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <ul className={`m-0 flex list-none flex-col gap-[0.6em] p-0 ${className}`} role="list">
      {children}
    </ul>
  )
}

export function BulletItem({ children }: { children: ReactNode }) {
  return (
    <li className="grid grid-cols-[0.34em_minmax(0,1fr)] gap-x-[0.6em]">
      <Dot />
      <span>{children}</span>
    </li>
  )
}

/** A single bulleted line outside a list (a card's paragraph swapped for its short version). */
export function Bullet({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 grid grid-cols-[0.34em_minmax(0,1fr)] gap-x-[0.6em]">
      <Dot />
      <span>{children}</span>
    </p>
  )
}
