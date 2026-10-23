# Attribution onboarding case study

A standalone, keyboard-driven case study presentation, embedded in Kyle's Framer portfolio. Built one or two beats at a time across sessions. Build only the beat Kyle sends. Never scaffold, draft, or guess at other beats.

## Sources
1. Kyle's decks: `~/Developer/tiled-whats-next` (feature pitch, sectioned) and `~/Developer/tiled-presentation` (return to Tiled, "Round two", live at https://www.kyleblackman.com/tiled-presentation). This project reuses their color tokens, card structure, card layout, and card transitions. It extends that system, it doesn't replace it.
2. Latest case study: https://www.kyleblackman.com/recommendation-cards. Patterns to draw from: hero (title, intro, skill tag row), numbered process steps, stat blocks, pull quotes, status-tagged takeaways (SHIPPED / DID NOT SHIP), hypothesis containers, captions, before/after comparisons.

## The project
- Subject: how Kyle diagnosed and redesigned Attribution onboarding at Freshpaint (healthcare marketing analytics). The redesign became a reusable onboarding framework used across multiple feature areas of the product.
- Audience: hiring panels for design roles, starting with a team that builds demos and prototypes. It must read as senior: clear reasoning, restraint, polish.
- Feel: keynote-level polish. Large, confident type, generous negative space, one idea per screen. Motion reveals and explains, it doesn't decorate.

## Typography and color
- Figtree for everything. A deliberate type scale (tokens in `src/styles/tokens.css`), not many weights.
- Colors: the deck tokens exactly. Don't introduce new colors without asking Kyle.

## The beat model
A beat is up to three steps. Right arrow advances one step, left arrow reverses it.
1. Card. A deck card tells part of the story. On advance it slides up and back out of view (deck recede, then fade; see Decisions).
2. Full-screen visual (optional). A visual or animation takes over the whole screen, not bound by the card.
3. Overlay (optional). After the visual finishes, a semi-transparent overlay fades in, blurs the visual, and text appears on top. Per beat: appears automatically when the visual completes (`trigger: 'auto'`) or waits for a key press (`trigger: 'key'`).

Advancing again animates the visual out and brings in the next beat's card. A beat can be a card alone, card + visual, or card + visual + overlay.

When a full-screen visual isn't warranted, a card can carry a lightweight in-card visual: table, comparison, stat block, before/after pair, pull quote. Build them from the shared components, using the case study's patterns.

## Structure
- Vite, React, TypeScript, Tailwind v4, Motion (`motion/react`).
- One step engine (`src/engine/useStepEngine.ts`) handles navigation, transitions, and state. Beats are data plus content, never custom navigation logic.
- Each beat is one file in `src/beats/`, registered in order in `src/beats/index.ts`. Adding a beat = one file + one line. A beat with a bespoke animated visual may add its visual in `src/visuals/`.
- Shared primitives in `src/components/`: Card, VisualFrame (+ VideoVisual), Overlay, Placeholder, Reveal, and in-card visuals (DataTable, Comparison, StatBlock, PullQuote, TagRow, Caption, StatusTag).
- Color and type values live as tokens (`src/styles/tokens.css`, motion in `src/engine/motion.ts`). Never hardcode them in a beat.
- Assets go in `public/assets/<beat-slug>/`. Video: muted, playsinline, no controls, H.264 mp4 with a poster frame (use `VideoVisual`). Only the current and adjacent steps mount their visual. The overlay auto trigger keys off the video's end or the animation's completion (`onComplete`).
- If a visual isn't ready, render a clearly labeled placeholder that describes what goes there, at the final aspect ratio.
- If Kyle points to a Figma frame, use the Figma MCP to pull its design context.

## Performance
The piece is card and animation heavy, so it must not accumulate DOM or running animations as the reader progresses.
- Only beats within one beat of the current beat are mounted (`WINDOW` in `src/App.tsx`). Everything else is unmounted.
- A visual's content mounts only when its step is current or adjacent, so video and heavy visuals load just in time and unload after.
- Visuals pause or reset when not active. Motion uses transform, opacity, and blur only (GPU friendly). Avoid large blurred layers that stay on screen.
- When adding heavy assets, keep files compressed and consider lazy-loading the beat's visual module.

## Motion rules
- The card exit matches the decks: 900ms `cubic-bezier(.16,.84,.34,1)`, lift -2.4vh, scale 0.92, blur 1.6px. Every other transition should feel like the same system.
- Quick, calm transitions, ease-out curves. Nothing bouncy unless Kyle asks.
- Animate transform, opacity, and blur only.
- Respect prefers-reduced-motion: every transition and animation has a crossfade or static fallback, and the overlay still works. Preview it with `?reduced-motion` in the URL.

## Embedding and accessibility
- Runs inside a Framer Embed (iframe), so it can't rely on the parent page. Before the first interaction it shows "Click to begin, then use arrow keys", and a click gives the iframe keyboard focus.
- Navigation: arrow keys (plus PageUp/PageDown, Space, Home/End), visible Back/Next controls, and horizontal swipe on touch. Progress shows "Beat X of Y" plus a 1px progress line.
- Responsive down to phone width.
- WCAG 2.1 AA is the floor. Check contrast for overlay text on blurred visuals and for any accent color on dark backgrounds. Focus states, semantic headings, alt text for images, and a text description for each video or visual (`visual.description`).
- Lowest text opacity is `fg-soft` (white 0.6). The deck's 0.42 label opacity fails AA (3.7 to 4.1:1), so it isn't used for text.

## Copy rules
- Use Kyle's copy exactly. If something should change (length, clarity, grammar), suggest the edit and wait for an answer. Never rewrite silently.
- Never invent facts, metrics, quotes, or details. If a beat needs something Kyle hasn't given, ask.
- No em dashes anywhere: copy, captions, alt text, on-screen labels, comments shown to users. Use commas, periods, or parentheses.
- No hype language.

## Working rhythm
- When Kyle sends a beat, build only that beat. Then run it and check it at desktop width, at phone width, and with reduced motion on. Report back in a few lines: what was built and anything to flag.
- Keep the Beats section below current.
- Commit after each beat with a message naming it.
- Run locally: `npm run dev`. Build: `npm run build`.
- Deploy: GitHub Pages via `.github/workflows/deploy.yml` (pushes to `main`). Vite `base: './'` so any repo path works. Don't create the GitHub repo or push until Kyle says to. Pages needs the repo to be public.

## Decisions
- 2026-10-23: Deploy to GitHub Pages (Kyle's call over Vercel), matching his decks.
- 2026-10-23: Vite + React + Motion instead of the decks' build.py + vanilla JS. Deck CSS values and card transforms are ported exactly.
- 2026-10-23: Card exit = the deck's recede transform plus a fade to 0, so the full-screen visual owns the screen. Card followed directly by another card keeps the deck behavior (stays dimmed behind). The deck's brightness filter is dropped to keep motion to transform, opacity, and blur.
- 2026-10-23: Two case study colors added as tokens: shipped `#61BF50`, caption `#AAB0B6`. Both pass AA on the page and card.
- 2026-10-23: Performance windowing (one beat either side mounted), per Kyle.

## Beats
| # | Slug | Steps | Visual | Status |
|---|------|-------|--------|--------|
| 1 | title | card, visual | Attribution page resolving from empty-state widgets to populated, built from placeholder shapes (`src/visuals/AttributionResolve.tsx`, timing in `TIMING`). Real screens to come. | Built, timing awaiting Kyle's review |

### Beat 1 copy (verbatim)
- Title: Diagnosing the problem, not the symptom
- Body: How a few offhand moments on customer calls led to an onboarding framework at Freshpaint.
- Skill tags: Root Cause Analysis, Codebase Investigation, Data-Informed Design, Rapid Prototyping, Cross-Functional Collaboration
- Overlay: none
- Treatment: keynote opener on a deck card with the accent glow. Left-aligned title at display size with "not the symptom" in accent (echoing the case study's two-tone title), body as a lead below, skill tags as quiet outlined pills anchored to the card's bottom edge behind a hairline. Reveal order: title, body, tags.
