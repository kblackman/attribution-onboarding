import { SITE } from './SiteHeader'
import { navigateViaFramer } from '../engine/frameNav'

/*
  Portfolio edition: what to do once the story ends, under the closing line (Kyle, 2026-11-04). The way back
  to the rest of the work, and a way to get in touch. Both open in the whole window, not inside the iframe.
*/
export function EndActions() {
  return (
    <div className="end-actions">
      <a className="pill secondary" href={SITE.home} target="_top" onClick={navigateViaFramer}>
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="16" height="16">
          <path d="M13 8H3M3 8L7.5 3.5M3 8L7.5 12.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        View All Work
      </a>
      <a className="pill primary" href={SITE.contact} target="_top">
        Get In Touch
      </a>
    </div>
  )
}
