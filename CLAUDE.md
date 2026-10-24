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
1. Card. Tells part of the story, in one of three variants (`Beat.variant`):
   - `card`: the deck card frame. On advance it recedes up and back, then fades (see Decisions).
   - `statement`: no container, larger type set directly on the background, for problem statements and other emphasis beats. Content via `<Statement headline body kicker kickerStyle />`. `kickerStyle: 'spotlight'` steps the headline and body back and centers the kicker in Figtree italic between two short accent rules (an editorial pull statement); `<em>` marks the accent line.
   - `hero`: the opening title screen, full-bleed, no logo (Framer's frame carries bkmn), with a Begin button and no hint text. `align: 'center'` centers it like the case study pages (Beat 1 uses this, at the larger `text-hero` size); default is the decks' left layout. Recedes into depth and fades fully on exit.
   A card can take extra key presses before moving on (`cardSteps`); content wrapped in `<Reveal step={n}>` lands on press n (e.g. a kicker).
2. Full-screen visual (optional). A visual or animation takes over the whole screen, not bound by the card.
3. Overlay (optional). After the visual finishes, a semi-transparent overlay fades in, blurs the visual, and text appears on top. Per beat: appears automatically when the visual completes (`trigger: 'auto'`) or waits for a key press (`trigger: 'key'`).

Advancing again animates the visual out and brings in the next beat's card. A beat can be a card alone, card + visual, or card + visual + overlay.

When a full-screen visual isn't warranted, a card can carry a lightweight in-card visual: table, comparison, stat block, before/after pair, pull quote. Build them from the shared components, using the case study's patterns.

## Structure
- Vite, React, TypeScript, Tailwind v4, Motion (`motion/react`).
- One step engine (`src/engine/useStepEngine.ts`) handles navigation, transitions, and state. Beats are data plus content, never custom navigation logic.
- Each beat is one file in `src/beats/`, registered in order in `src/beats/index.ts`. Adding a beat = one file + one line. A beat with a bespoke animated visual may add its visual in `src/visuals/`.
- Shared primitives in `src/components/`: Card (all three variants), Statement, BeginRow, VisualFrame (+ VideoVisual), Overlay, Placeholder, Reveal, and in-card visuals (DataTable, Comparison, StatBlock, PullQuote, TagRow, Caption, StatusTag).
- `HandCircle` is a crude hand-drawn circle in the annotation color that marks empty areas. It draws clockwise with a rotating-mask sweep (transform only), fades under reduced motion, and has a few shape variants so repeats don't look stamped. Beat 3 uses it; Beat 4's empty-state montage should reuse it.
- Story cards set their body at the statement size (`text-statement`), per Kyle. Text-heavy cards add `cardDense: true` (the decks' tighter sub-slide padding) and a ~64ch measure on the body itself, and must fit without scrolling at 1920x1080, 1440x900, 1280x720, and a 375x812 phone.
- `HeroBackdrop` pushes imagery back behind hero text, after the case study heroes: 21% opacity, centered behind the text, tilted straight back (top away, bottom nearest the viewer), bottom faded into the page. Swap its children for real imagery; drop `placeholderLabel` when it's real.
- Coded visuals in `src/visuals/` use `useVisualPlayback` (play, finish, reset) and keep a `TIMING` block at the top for tuning.
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
- It runs inside a Framer Embed (iframe), so it can't rely on the parent page. Kyle removed the on-screen instruction: the hero's Begin button starts it, and any click gives the iframe keyboard focus. As in the decks, the bottom control bar stays hidden on the hero and appears once it's left.
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
- 2026-10-24: Hero intro text is white (fg), per Kyle. Backdrop re-tilted straight back and centered, per Kyle (the earlier version leaned left).
- 2026-10-24: Placeholder product UI never uses Kyle's brand colors, per Kyle. It uses its own `product-*` palette (deep teal ink, teal, mint, tint), vaguely Freshpaint (whose site uses deep teal `#032126`, teal `#016653`, mint `#85D7BF`) but not copied. Use these tokens for any mock product screen.
- 2026-10-24: Annotation color is vibrant magenta `#FF2E93` (`annotation` token), per Kyle. All markup on visuals (circles, future arrows or highlights) uses it, never brand or product colors.
- 2026-10-24: Beat 3 body raised to the problem statement's size, per Kyle (the smaller reading size was too small). Added `cardDense`.
- 2026-10-24: Skill pills copied exactly from the case study's Role Pills, per Kyle: `#232324` fill (`pill`), 1px inside border at 15% white (`pill-border`), 7px radius, 4px 8px padding, 14px regular in accent, 10px gap. Fixed size, not viewport-scaled. Accent on the fill is about 10:1.
- 2026-10-23: Performance windowing (one beat either side mounted), per Kyle.
- 2026-10-23: Beat 1 is not a card. It's the decks' hero (Kyle: "using the word card was a bad move"), with no bkmn logo since the Framer frame has one. The hero fades fully on exit (deck stops at 0.1) so it doesn't ghost behind frameless statements.
- 2026-10-23: Statement variant built as a reusable card type for emphasis beats, per Kyle. Its kicker uses in-card key presses (`cardSteps`).
- 2026-10-23: Kyle's narrative plan: hero lightly describing what's being solved, then the problem statement, then the first story beat (how he came across the problem). No visual after the hero. The empty-to-populated Attribution resolve (`src/visuals/AttributionResolve.tsx`, timing approved) is kept unregistered; it shows the outcome, so it may fit a later results beat.
- 2026-10-23: Hero gets a pushed-back visual like Kyle's case study heroes, supporting weight rather than the subject. Placeholder imagery is the populated Attribution page (`AttributionPage`, static), labeled as a placeholder.
- 2026-10-23: Hero centered and enlarged after the case study hero; no instruction text. Problem kicker restyled as a centered italic spotlight (research: editorial pull statements set in a true italic between hairline rules; Figtree has a true italic, so the one typeface rule holds).

## Beats
| # | Slug | Steps | Visual | Status |
|---|------|-------|--------|--------|
| 1 | title | hero (centered) | No full-screen visual. Pushed-back backdrop with placeholder imagery | Revised 2026-10-23, awaiting Kyle's review |
| 3 | pattern | card, visual | 2x2 video-call grid builds one tile at a time (Day 1 New feature, Day 1 Bug walkthrough, Day 2 Adoption check-in, Day 2 New feature), each sharing the same half-set-up dashboard with a hand-drawn circle on its empty area; the last tile then zooms to fill the frame and holds. Placeholder shapes (`src/visuals/SessionGrid.tsx`, timing in `TIMING`). Reduced motion: all tiles and circles fade in together, no zoom. | Built, awaiting Kyle's review |
| 2 | problem | statement (2 presses: body, then spotlight kicker), visual | Three paths branching away from a simplified product shape to Documentation, CS call, Account manager. Placeholder shapes (`src/visuals/SetupPaths.tsx`, timing in `TIMING`). | Built, awaiting Kyle's review |

## Up next and open notes
- The case study title may change later. "Diagnosing the problem, not the symptom" stands for now (title in `src/beats/01-title.tsx` and `index.html`).
- Beat 4 is an empty-state montage that reuses `HandCircle`. Wait for Kyle's copy.

### Beat 1 copy (verbatim)
- Title: Diagnosing the problem, not the symptom
- Body: How a few offhand moments on customer calls led to an onboarding framework at Freshpaint.
- Skill tags: Root Cause Analysis, Codebase Investigation, Data-Informed Design, Rapid Prototyping, Cross-Functional Collaboration
- Overlay: none
- Treatment: centered hero like the case study page, at the larger `text-hero` size, "not the symptom" in accent (the case study's two-tone title), sub below, skill tags as centered outlined pills, then the Begin button. No logo, no instruction text. Reveal order: title, sub, tags, Begin.

### Beat 2 copy (verbatim)
- Headline: The problem
- Body: Freshpaint's healthcare marketing analytics platform was powerful, but it had no self-serve system in place to help customers reach the value they'd paid for. Setup flows were confusing and offered little to no guidance. Getting set up correctly meant reading dense documentation or booking a call with CS or an account manager.
- Kicker (next key press, spotlight): Everyone knew it was a problem. Nobody prioritized fixing it. (Updated by Kyle 2026-10-23.)
- Visual labels: Documentation, CS call, Account manager
- Overlay: none

### Beat 3 copy (verbatim)
- Headline: A pattern was emerging
- Body 1: We held regular research sessions with a pool of customer accounts. In most of them, customers shared their screen, whether to try a new feature, show us a bug, or walk us through how they used something we'd already released.
- Body 2: Over two days, I sat in on four of these sessions. Each time a customer shared their screen, their Attribution dashboard was only half set up. Some hadn't connected their ad sources, so their spend data never appeared. Others hadn't enabled AI, so Recommendation Cards never showed up. The thread was the same: customers paying for a feature they weren't getting full value from.
- Closing question (own paragraph, accent, extra space above): Was it a coincidence, or a pattern?
- Visual labels: Day 1, Day 1, Day 2, Day 2; New feature, Bug walkthrough, Adoption check-in, New feature
- Overlay: none
