interface TagRowProps {
  tags: string[]
  /** Accessible name for the list, e.g. "Skills". */
  label: string
  className?: string
}

/**
 * Skill tags, matching the case study's Role Pills exactly: #232324 fill, 1px inside border at 15% white,
 * 7px radius, 4px 8px padding, 14px Figtree regular in accent, 10px apart. Fixed size, not scaled.
 */
export function TagRow({ tags, label, className = '' }: TagRowProps) {
  return (
    <ul aria-label={label} className={`m-0 flex list-none flex-wrap gap-[10px] p-0 ${className}`}>
      {tags.map((t) => (
        <li key={t} className="whitespace-nowrap rounded-[var(--radius-pill-tag)] bg-pill px-2 py-1 text-[14px] font-normal leading-[1.2] text-accent shadow-[inset_0_0_0_1px_var(--color-pill-border)]">
          {t}
        </li>
      ))}
    </ul>
  )
}
