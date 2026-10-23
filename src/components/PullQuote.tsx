/** Case study pull quote: large quote with the attribution in uppercase accent. Quotes must be real; never invent one. */
export function PullQuote({ quote, attribution, className = '' }: { quote: string; attribution: string; className?: string }) {
  return (
    <figure className={`m-0 max-w-[40ch] border-l-2 border-accent pl-[clamp(16px,calc(var(--u)*2),32px)] ${className}`}>
      <figcaption className="mb-3 text-label uppercase text-accent">{attribution}</figcaption>
      <blockquote className="m-0 text-lead text-fg">{quote}</blockquote>
    </figure>
  )
}
