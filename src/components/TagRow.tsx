interface TagRowProps {
  tags: string[]
  /** Accessible name for the list, e.g. "Skills". */
  label: string
  className?: string
}

/** Skill tags: quiet outlined pills on one wrapping row. */
export function TagRow({ tags, label, className = '' }: TagRowProps) {
  return (
    <ul aria-label={label} className={`m-0 flex list-none flex-wrap gap-2 p-0 sm:gap-3 ${className}`}>
      {tags.map((t) => (
        <li key={t} className="whitespace-nowrap rounded-full border border-hairline-strong px-[0.95em] py-[0.5em] text-ui text-fg-muted">
          {t}
        </li>
      ))}
    </ul>
  )
}
