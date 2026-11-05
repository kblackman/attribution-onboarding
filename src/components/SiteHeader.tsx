/*
  Portfolio edition: the case study header from Kyle's Framer site, inside the deck (the deck fills the Framer
  page in an iframe, so Framer's own hide-on-scroll header can't work here). On the hero it matches the site's
  case study header: "← View All Work" left, the bkmn logo centered, an outlined "Get In Touch" right. Once the
  reader leaves the hero it compacts to a small "← View All Work" pill in the top-left corner, so the way home
  stays one click away without covering the story. Links open in the whole window, not inside the iframe.
  (Kyle, 2026-11-04.)
*/
export const SITE = {
  home: 'https://www.kyleblackman.com/',
  // Get In Touch goes to LinkedIn (Kyle, 2026-11-04)
  contact: 'https://www.linkedin.com/in/kyleblackman/',
}

// the site uses a plain arrow character, not an icon; matched so the link measures the same
const Arrow = () => (
  <span aria-hidden="true" className="site-arrow">
    &larr;
  </span>
)

/** hidden: the last screen, where the end-of-story actions carry the way back instead. */
export function SiteHeader({ compact, hidden = false }: { compact: boolean; hidden?: boolean }) {
  return (
    <header className={`site-header${compact ? ' is-compact' : ''}${hidden ? ' is-hidden' : ''}`} inert={hidden}>
      <a className="site-back" href={SITE.home} target="_top">
        <Arrow /> View All Work
      </a>
      <a className="site-logo" href={SITE.home} target="_top" aria-label="Kyle Blackman, home" tabIndex={compact ? -1 : undefined} aria-hidden={compact || undefined}>
        <img src={`${import.meta.env.BASE_URL}assets/bkmn-logo.svg`} alt="" width={110} height={32} />
      </a>
      <a className="site-contact" href={SITE.contact} target="_top" tabIndex={compact ? -1 : undefined} aria-hidden={compact || undefined}>
        Get In Touch
      </a>
    </header>
  )
}
