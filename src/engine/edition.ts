/*
  Two editions of the same case study, built from one codebase:
  - presentation (index.html): Kyle's live version. He drives it with the arrow keys; T toggles present mode.
  - portfolio (portfolio.html): the self-serve version linked from his portfolio, for readers on their own.
    It shows a first-run keyboard coach pointing at Next, autoplays the multi-step walkthroughs (with a
    Pause / Play control and P as the override), and has no present mode.
  The edition comes from <meta name="edition" content="portfolio"> in the page, so beats and visuals stay shared.
*/
export const SELF_SERVE =
  typeof document !== 'undefined' && document.querySelector('meta[name="edition"]')?.getAttribute('content') === 'portfolio'
