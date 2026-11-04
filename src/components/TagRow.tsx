interface TagRowProps {
  tags: string[]
  /** Accessible name for the list, e.g. "Skills". */
  label: string
  className?: string
  /** Hero: the exact case study size up to 1920 wide, then grows with the screen (same proportions). */
  fluid?: boolean
}

/**
 * Skill tags, matching the case study's Role Pills exactly: #232324 fill, 1px inside border at 15% white,
 * 7px radius, 4px 8px padding, 14px Figtree regular in accent, 10px apart. Fixed size, not scaled.
 */
const FLUID_LI = 'rounded-[max(7px,0.5em)] px-[max(8px,0.57em)] py-[max(4px,0.29em)] text-[length:max(14px,calc(var(--u)*0.73))]'
const FIXED_LI = 'rounded-[var(--radius-pill-tag)] px-2 py-1 text-[14px]'

export function TagRow({ tags, label, className = '', fluid = false }: TagRowProps) {
  return (
    <ul aria-label={label} className={`m-0 flex list-none flex-wrap p-0 ${fluid ? 'gap-[max(10px,calc(var(--u)*0.52))]' : 'gap-[10px]'} ${className}`}>
      {tags.map((t) => (
        <li key={t} className={`whitespace-nowrap bg-pill font-normal ${fluid ? FLUID_LI : FIXED_LI} leading-[1.2] text-accent shadow-[inset_0_0_0_1px_var(--color-pill-border)]`}>
          {t}
        </li>
      ))}
    </ul>
  )
}
