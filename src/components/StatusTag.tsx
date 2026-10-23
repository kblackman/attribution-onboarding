/** Status tag for takeaways, as in the case study (SHIPPED / DID NOT SHIP). */
export function StatusTag({ status }: { status: 'shipped' | 'did-not-ship' }) {
  const shipped = status === 'shipped'
  return (
    <span className={`inline-flex items-center gap-2 text-label font-bold uppercase ${shipped ? 'text-shipped' : 'text-caption'}`}>
      <span className={`block h-2 w-2 rounded-full ${shipped ? 'bg-shipped' : 'border border-caption'}`} aria-hidden="true" />
      {shipped ? 'Shipped' : 'Did not ship'}
    </span>
  )
}
