import { useEffect, useRef } from 'react'
import type { Beat } from '../engine/types'
import type { BeatPlace } from '../engine/sections'

interface SectionIndexProps {
  open: boolean
  beats: Beat[]
  places: BeatPlace[]
  currentBeat: number
  /** Numbers that have a section card, for the key hint (e.g. ['01', '02']). */
  sectionNumbers: string[]
  onJump: (beat: number) => void
  onClose: () => void
}

/**
 * The section index, ported from the Tiled feature pitch deck: every beat grouped by section, the current one
 * marked. Opens from the progress label (or S). Up and Down move through it, Enter jumps, Escape closes.
 * Built from the beats list and src/sections.ts, so new beats and sections appear on their own.
 */
export function SectionIndex({ open, beats, places, currentBeat, sectionNumbers, onJump, onClose }: SectionIndexProps) {
  const listRef = useRef<HTMLDivElement>(null)

  // group beats by section, in order
  const groups: { key: string; number: string; label: string; items: number[] }[] = []
  places.forEach((p, b) => {
    const last = groups[groups.length - 1]
    if (!last || last.key !== p.section.id) groups.push({ key: p.section.id, number: p.number, label: p.section.label, items: [b] })
    else last.items.push(b)
  })

  // on open, focus the current beat and keep it in view, a little below the top
  useEffect(() => {
    if (!open || !listRef.current) return
    const cur = listRef.current.querySelector<HTMLButtonElement>('[aria-current="true"]') ?? listRef.current.querySelector('button')
    if (!cur) return
    listRef.current.scrollTop = Math.max(0, cur.offsetTop - listRef.current.clientHeight / 3)
    cur.focus({ preventScroll: true })
  }, [open])

  const onKey = (e: React.KeyboardEvent) => {
    const items = [...(listRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])]
    const i = items.indexOf(document.activeElement as HTMLButtonElement)
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      e.stopPropagation()
      const t = items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]
      t?.focus({ preventScroll: true })
      t?.scrollIntoView({ block: 'nearest' })
    } else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      onClose()
    } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      // Enter and Space belong to the focused item; Left and Right shouldn't move the presentation underneath
      e.stopPropagation()
    }
  }

  return (
    <div
      id="section-index"
      role="menu"
      aria-label="All beats"
      className={`secmenu ${open ? 'show' : ''}`}
      aria-hidden={!open}
      inert={!open}
      onKeyDown={onKey}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="sm-list" ref={listRef}>
        {groups.map((g) => (
          <div key={g.key} className="sm-group" role="group" aria-label={g.number ? `${g.number} ${g.label}` : g.label}>
            <div className="sm-sec">
              {g.number && <span className="sn">{g.number}</span>}
              {g.label}
            </div>
            {g.items.map((b) => {
              const p = places[b]
              return (
                <button
                  key={beats[b].slug}
                  type="button"
                  role="menuitem"
                  className="sm-item"
                  aria-current={b === currentBeat ? 'true' : 'false'}
                  onClick={() => onJump(b)}
                >
                  <span className="pos">{p.isSectionCard ? '' : `${p.pos}/${p.count}`}</span>
                  <span>{beats[b].title}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
      <div className="keys-hint">
        {sectionNumbers.length > 0 && (
          <>
            <kbd>{Number(sectionNumbers[0])}</kbd>
            {sectionNumbers.length > 1 && (
              <>
                {' to '}
                <kbd>{Number(sectionNumbers[sectionNumbers.length - 1])}</kbd>
              </>
            )}{' '}
            jump to a section &middot;{' '}
          </>
        )}
        <kbd>S</kbd> all beats &middot; <kbd>Home</kbd> start
      </div>
    </div>
  )
}
