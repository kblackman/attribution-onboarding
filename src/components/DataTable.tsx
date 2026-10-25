interface DataTableProps {
  caption: string
  columns: string[]
  rows: string[][]
  /** Keep the column labels for screen readers only. */
  hideHeader?: boolean
  className?: string
}

/** Deck table: uppercase header labels, hairline rows, first column emphasized. */
export function DataTable({ caption, columns, rows, hideHeader = false, className = '' }: DataTableProps) {
  return (
    <table className={`w-full border-collapse text-body ${className}`}>
      <caption className="sr-only">{caption}</caption>
      <thead className={hideHeader ? 'sr-only' : undefined}>
        <tr>
          {columns.map((c) => (
            <th key={c} scope="col" className="border-b border-hairline-strong pb-3 pr-6 text-left text-label font-normal uppercase text-fg-soft">{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-hairline last:border-0">
            {r.map((cell, j) => (
              <td key={j} className={`py-3 pr-6 align-top ${j === 0 ? 'font-semibold text-fg' : 'text-fg-muted'}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
