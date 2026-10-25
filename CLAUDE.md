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
- Exception (Kyle, 2026-10-25): annotations, meaning Kyle's handwritten markup on visuals, use Caveat (`--font-hand`). Nothing else does.
- Exception: terminal visuals (`TerminalThread`) use the system monospace stack (Tailwind `font-mono`), per Kyle's brief; no font is loaded for it.
- Colors: the deck tokens exactly. Don't introduce new colors without asking Kyle.

## System (read before building any beat)
Every screen belongs to one of three tiers. A new beat picks its tier first and follows that tier's rules. Don't invent a new treatment per beat; extend a tier instead, and only with Kyle's OK.

| Tier | Used for | Layout | Motion | Signature |
|---|---|---|---|---|
| Moments | Hero, section titles, punchline overlays | Centered | Rise from behind / with the horizon line | `HorizonLine`, the thin accent line that draws out from center |
| Story | Every narrative beat (variant `statement`, content via `Statement`) | Left-aligned, frameless, `text-story` headline, `text-statement` body | Zoom through depth (in from larger, out to smaller) | None. Type does the work. |
| Evidence | Full-screen visuals; cards holding an artifact (table, stat block, before/after, pull quote) | Full-bleed, or the deck card | Visuals enter from depth; cards keep the deck rise | Same placeholder badge, same frame |

Rules:
- Rhythm: each beat runs Story, then Evidence, then (optionally) a Moment. Text sets it up, a visual proves it, an overlay lands it. Don't put two full-screen visuals back to back, and don't lead a beat with its visual.
- A beat's punchline is never inline: it's a Moment, as a `cardOverlay` with `SpotlightLine` (italic, centered, horizon line beneath, the point in `<em>`). The statement pushes back behind it.
- Yellow means "the point". One yellow moment per screen: the horizon line plus the emphasized line. Chrome (Next, Begin, progress line) and Kyle's case study pills are the only other yellow. Incidental labels, stamps, dots, and badges are neutral.
- Annotation (Kyle's markup on visuals) is magenta, never yellow.
- Mock product UI uses the `product-*` palette only.
- One headline size for all story beats (`text-story`). Text-heavy beats add `Statement wide` and `cardDense`.

## The beat model
A beat is up to three steps. Right arrow advances one step, left arrow reverses it.
1. Card. Tells part of the story, in one of three variants (`Beat.variant`):
   - `card`: the deck card frame. Reserved for beats that hold an artifact (table, stat block, before/after, pull quote), so the frame reads as evidence. On advance it recedes up and back, then fades (see Decisions).
   - `statement`: no container, larger type set directly on the background. The default for narrative beats (Kyle, 2026-10-24). Motion is a zoom through depth: it arrives from in front of the screen (larger, blurred) and settles; moving on, it shrinks, blurs, and fades away; reverse plays it backward. Its text arrives with the zoom, with no separate rise. Content via `<Statement headline body kicker align />` (works on a card too).
   - `section`: a cinematic title sequence, not a slide, made with `sectionCard('<id>')` (one line in `src/beats/index.ts`). Frameless and full-screen: from a dark vignetted screen, an accent horizon line draws out from center, the label rises letter by letter from behind it (sharpening as it clears), a warm glow blooms behind the word, and a giant outlined numeral settles far in the background; the small number, tagline, and a chapter row (01 to 05, current lit) land last. Leaves like a statement (shrinks away through depth). Timing in `TIMING` in `src/components/SectionCard.tsx`. Reduced motion: everything fades in together.
   - `hero`: the opening title screen, full-bleed, no logo (Framer's frame carries bkmn), with a Begin button and no hint text. `align: 'center'` centers it like the case study pages (Beat 1 uses this, at the larger `text-hero` size); default is the decks' left layout. Recedes into depth and fades fully on exit.
   A beat can add a full-screen `cardOverlay` on the press after its card: the card pushes back (smaller, blurred, dimmed) and the overlay's scrim and text take the screen, reversing on Back. `SpotlightLine` is the italic pull-statement content for it.
   A visual can take several key presses too (`visual.steps`): it receives the current `sub` and can call `requestNext(sub)` to auto-advance, which only fires if the reader is still on that step. Auto-advance should run forward only (after a step back, wait for a key).
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
- `ChatThread` is a reusable generic team chat (channel, role avatars, timestamps, reactions; no real product's look) whose messages arrive one at a time when its card reveals. `text-with-aside` (with `.twa-main`, `.twa-aside`, `.twa-rest`) puts an artifact beside a card's first paragraph and stacks it after that paragraph on phones.
- `Annotation` is Kyle's markup on a screenshot: a hand-drawn circle around a zone, a handwritten label (Caveat), and a hand-drawn arrow from the label to the circle's edge, all in the annotation color. Zones and label spots are percent of the image, so it holds for any screenshot size. Use it for any circled callout.
- The setup map (`src/visuals/setup-map.tsx`) is reusable: nodes, edges, the 14-step path, and node/edge renderers. Beat 8's ride-along walks it; a 04 Solution beat is meant to redraw the same nodes as one linear path. `ShotView` (in `EmptyStateMontage.tsx`) renders a screenshot with its annotation, shared by the montage, the mapping board, and the map, so real screenshots swapped into `SHOTS` appear everywhere.
- `RequiredOptional` is a reusable two-column Required / Optional split (no yellow).
- `TerminalThread` is a reusable reconstruction of a Claude Code session, per Kyle: "> " prompts, coral ● tool-call lines with ⎿ results, white ● answers, a coral ✻ spinner with an elapsed timer, and the prompt box with a blinking cursor. No logo, wordmark, or welcome banner. It grows to the available height, then scrolls older lines up. Separate from `ChatThread`. `StepStatusList` is a reusable status list (shipped-green check for done, half marker for partial).
- `HandCircle` is a crude hand-drawn circle in the annotation color that marks empty areas. It draws clockwise with a rotating-mask sweep (transform only), fades under reduced motion, and has a few shape variants so repeats don't look stamped. `dashed` marks one circle as different (Beat 4's "Waiting on data", which a later beat calls back to). Beat 3 uses it; Beat 4's empty-state montage should reuse it.
- Story beats set their body at the statement size (`text-statement`), per Kyle. Text-heavy cards add `cardDense: true` (the decks' tighter sub-slide padding) and a ~64ch measure on the body itself, and must fit without scrolling at 1920x1080, 1440x900, 1280x720, and a 375x812 phone.
- `HeroBackdrop` pushes imagery back behind hero text, after the case study heroes: 21% opacity, centered behind the text, tilted straight back (top away, bottom nearest the viewer), bottom faded into the page. Swap its children for real imagery; drop `placeholderLabel` when it's real.
- Coded visuals in `src/visuals/` use `useVisualPlayback` (play, finish, reset) and keep a `TIMING` block at the top for tuning.
- Color and type values live as tokens (`src/styles/tokens.css`, motion in `src/engine/motion.ts`). Never hardcode them in a beat.
- Assets go in `public/assets/<beat-slug>/`. Video: muted, playsinline, no controls, H.264 mp4 with a poster frame (use `VideoVisual`). Only the current and adjacent steps mount their visual. The overlay auto trigger keys off the video's end or the animation's completion (`onComplete`).
- If a visual isn't ready, render a clearly labeled placeholder that describes what goes there, at the final aspect ratio.
- If Kyle points to a Figma frame, use the Figma MCP to pull its design context.

## Sections
- Defined in `src/sections.ts` (temporary, expected to change). Rename, reword, or reorder there; numbers come from order, so nothing else hardcodes them.
- A beat's section is inferred from position: everything after a section card belongs to it until the next one; beats before the first section card are the Prologue. Beat files never name their section.
- Progress label, in the decks' format: `01 · 2/3` (section number, position among that section's beats, section card excluded), `01 · Discovery` on a section card, `Prologue · 1/2` before the first section.
- Section cards are added as each section is built. Current plan: Prologue (Title, The problem), 01 Discovery, 02 Diagnosis, 03 Approach, 04 Solution, 05 Impact.

## Performance
The piece is card and animation heavy, so it must not accumulate DOM or running animations as the reader progresses.
- Only beats within one beat of the current beat are mounted (`WINDOW` in `src/App.tsx`). Everything else is unmounted.
- A visual's content mounts only when its step is current or adjacent, so video and heavy visuals load just in time and unload after.
- Layers that end fully transparent are also set to `visibility: hidden` when their fade finishes, so the browser stops compositing them (this also avoids a Chrome artifact where a blurred transparent full-screen layer rendered the page dark).
- Visuals pause or reset when not active. Motion uses transform, opacity, and blur only (GPU friendly). Avoid large blurred layers that stay on screen.
- When adding heavy assets, keep files compressed and consider lazy-loading the beat's visual module.

## Motion rules
- The card exit matches the decks: 900ms `cubic-bezier(.16,.84,.34,1)`, lift -2.4vh, scale 0.92, blur 1.6px. Every other transition should feel like the same system.
- Quick, calm transitions, ease-out curves. Nothing bouncy unless Kyle asks.
- Animate transform, opacity, and blur only.
- Respect prefers-reduced-motion: every transition and animation has a crossfade or static fallback, and the overlay still works. Preview it with `?reduced-motion` in the URL.

## Embedding and accessibility
- It runs inside a Framer Embed (iframe), so it can't rely on the parent page. Kyle removed the on-screen instruction: the hero's Begin button starts it, and any click gives the iframe keyboard focus. As in the decks, the bottom control bar stays hidden on the hero and appears once it's left.
- Navigation: arrow keys (plus PageUp/PageDown, Space, Home/End), visible Back/Next controls, and horizontal swipe on touch. Section index (ported from the Tiled feature pitch deck, `src/components/SectionIndex.tsx`): the progress label is a button that opens every beat grouped by section, current one marked; S toggles it, 1 to 9 jump to that section's title, Up/Down move, Enter jumps, Escape or a click outside closes. Built from the beats list and `src/sections.ts`, so new beats and sections appear on their own. Progress shows "Beat X of Y" plus a 1px progress line.
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
- 2026-10-24: Beat 3 is frameless (statement), per Kyle: the card "takes me out of it". Frameless is the default for narrative beats; the card is saved for beats holding an artifact. Statements now zoom through depth (in from larger, out to smaller, reversible), per Kyle.
- 2026-10-24: The problem statement sits on a left-aligned deck card with the accent glow, per Kyle. Its kicker moved off the card into a full-screen `cardOverlay` (card pushes back behind it), per Kyle.
- 2026-10-24: Section card type and section-aware progress (`01 · 2/3`), per Kyle. Sections live in one data file so they're cheap to change. 01 Discovery opens before Beat 3.
- 2026-10-24: A card stays dimmed behind the next beat (deck behavior) only when the next beat is framed too; a frameless statement after a card gets a clean slate.
- 2026-10-25: Map nodes outside Attribution (pages and drawers) now share the screenshots' shell (radius, header bar, shadow), per Kyle: the drawer shape read as an error. "Sketching" changed to "prototyping" (Kyle mapped in FigJam, then prototyped in Claude Code). The terminal now looks like a classic Claude Code session (Kyle approved Claude's coral `#D97757` as the `coral` token, for that visual only); its tool-call lines and later elapsed times are generic placeholders.
- 2026-10-25: "Designing for real numbers" is a card (it holds the ranges table, header row hidden visually but kept for screen readers via `DataTable hideHeader`). "Two moments, two patterns" is a frameless statement. Its stress-test paragraph became its own beat, "Showing my work" (Kyle: "it's a new idea"), a frameless statement followed by the prototype visual. `TweaksPanel` (`src/components/TweaksPanel.tsx`) is reusable for any prototype that switches states; on phones it sits below the window. Dense cards trim vertical padding on short laptop screens (max-height 760px) so the longest ones fit at 1280x720.
- 2026-10-25: Started 03 Approach. Per the System, "Checking before prototyping" is a frameless statement followed by a 4-press terminal visual (one press per exchange, forward-only auto-advance, longer first search); "What the code told me" is a card holding the v1 status list.
- 2026-10-25: Built 02 Diagnosis (section card plus three beats). Placed after "How widespread was it?" rather than after "Checking the hunch", since its beats reuse that montage and answer its overlay. Per the System, "Connecting the dots" and "Checking my work" are frameless statements (no artifact); "One problem, not six" is a card (it holds the Required / Optional split). Its headline is display size with "not six" in accent, echoing the title's two-tone device. Diagnosis tagline updated to Kyle's: "Mapping the flow to see the shape of the problem."
- 2026-10-25: Added the section index (jump anywhere), same mechanism as the Tiled feature pitch deck, per Kyle.
- 2026-10-25: Beat 4 split in two, per Kyle: "Checking the hunch" (statement, then the team chat as a full-screen visual) and "How widespread was it?" (statement, then the montage and overlay). The crowded card is gone. Context for the chat lives in its own UI (a date divider), not a title on the visual. Chat wording updated and approved; teammates appear by role, the CEO as "our CEO".
- 2026-10-25: Cards and statements use `justify-content: safe center`, so content taller than the screen (phones) top-aligns instead of being cut off; cards also reset to their top when they become current.
- 2026-10-25: Unified the presentation into three tiers (Moments, Story, Evidence), per Kyle ("starting to feel a little disjointed"). Problem back to a frameless story statement; one story headline size; every punchline is a full-screen overlay with the horizon line (Beat 3's question moved to an overlay); the hero introduces the horizon line; incidental yellow went neutral. See System.
- 2026-10-25: Section cards became a cinematic title sequence (frameless, letter-by-letter rise from behind a horizon line, glow, giant outlined numeral, chapter row), per Kyle: "more cinematic title card reveal instead of a traditional PowerPoint section". The pie motif and card frame were dropped.
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
| 2a | section-discovery | section title sequence | None | Reworked 2026-10-25, awaiting Kyle's review |
| 3 | pattern | statement (dense, wide), card overlay (question), visual | 2x2 video-call grid builds one tile at a time (Day 1 New feature, Day 1 Bug walkthrough, Day 2 Adoption check-in, Day 2 New feature), each sharing the same half-set-up dashboard with a hand-drawn circle on its empty area; the last tile then zooms to fill the frame and holds. Placeholder shapes (`src/visuals/SessionGrid.tsx`, timing in `TIMING`). Reduced motion: all tiles and circles fade in together, no zoom. | Built, awaiting Kyle's review |
| 4 | hunch | statement, visual | Full-screen team chat (#team-indigo, "After the research sessions" divider), messages landing one at a time (`src/visuals/TeamChat.tsx`). | Built 2026-10-25, awaiting Kyle's review |
| 5 | widespread | statement (wide), visual, overlay (auto, holds for a key press) | Empty-state montage as a falling stack with handwritten annotations (`src/visuals/EmptyStateMontage.tsx`, swappable `SHOTS`). | Built 2026-10-25, awaiting Kyle's review |
| 6 | dots | statement (wide), visual | Mapping board (whiteboard): montage screenshots as anchors with annotations, step boxes, arrows, friction stickies (`src/visuals/MappingBoard.tsx`). | Built 2026-10-25, awaiting Kyle's review |
| 7 | checking | statement (wide), visual (15 presses), overlay (key press) | Setup ride-along: marker and camera walk the 14-step path, counters, then a zoom-out to the whole map (`src/visuals/SetupRideAlong.tsx`, map in `setup-map.tsx`). Auto-advances every 2s, forward only. | Built 2026-10-25, awaiting Kyle's review |
| 8 | one-problem | card (Evidence: Required / Optional beside the second paragraph) | None | Built 2026-10-25, awaiting Kyle's review |
| 9 | before-prototyping | statement (wide), visual (4 presses) | Reconstructed Claude Code session (Claude Code styling, coral accent), one exchange per press (`src/visuals/CodeConversation.tsx`). | Built 2026-10-25, awaiting Kyle's review |
| 10 | code-told | card (Evidence: v1 status list beside the text) | None | Built 2026-10-25, awaiting Kyle's review |
| 11 | real-numbers | card (Evidence: ranges table beside the second paragraph, caption "Approximate ranges.") | None | Built 2026-10-25, awaiting Kyle's review |
| 12 | two-moments | statement (wide, dense) | None | Built 2026-10-25, awaiting Kyle's review |
| 13 | showing-work | statement (wide), visual (4 presses) | Prototype with a reusable `TweaksPanel` (Data load: Low 1, Average 2, High 15, Outlier 22). Low and Average show the setup list; High and Outlier the waiting-room grid, wrapping after four. Rows animate in and reflow (`src/visuals/LoadPrototype.tsx`). Auto-advances every ~2s, forward only. Mock event names. | Built 2026-10-25, awaiting Kyle's review |
| 2 | problem | statement, card overlay (kicker), visual | Three paths branching away from a simplified product shape to Documentation, CS call, Account manager. Placeholder shapes (`src/visuals/SetupPaths.tsx`, timing in `TIMING`). | Built, awaiting Kyle's review |

## Up next and open notes
- The case study title may change later. "Diagnosing the problem, not the symptom" stands for now (title in `src/beats/01-title.tsx` and `index.html`).
- 02 Diagnosis is built. 03 Approach has its section card and five beats (Checking before prototyping, What the code told me, Designing for real numbers, Two moments, two patterns, Showing my work); more Approach beats to come, wait for Kyle's copy.
- Beat 4 is built (Checking the hunch). Kyle feels the card plus chat reads crammed; he may revisit it later (not now).
- Beat 4's montage became a falling stack, per Kyle; the pile-and-lines ending was dropped. Screenshots are bigger, annotations handwritten with arrows (per Kyle).
- To swap real screenshots into Beat 4: drop files in `public/assets/hunch/`, then in `SHOTS` (top of `src/visuals/EmptyStateMontage.tsx`) set `src` and `aspect` (width / height), and measure `empty` (percent of the image) on the real screenshot. Any size or shape works; `labelAt` moves a label if needed. Repeats in the fast cascade reuse these automatically. The 02 Diagnosis section card comes next, then Diagnosis beats.
- (Kept for reference) Beat 4 brief context: where Kyle realized customers had a real problem, conferred with his team, and investigated on his own. Waiting on his copy.
- When Kyle asks for them ("ask me the Beat 4 questions", or similar), ask all of these again, in full:
  1. Conferring with the team: who did you bring it to (PM, engineering, CS, account managers), and what came back? Did they recognize it, push back, or say it was a known issue nobody owned? Any real quotes to use?
  2. Your own investigation: what did you actually do (codebase, product data, support tickets, walking the setup flow yourself), and what did you find? This is where the "Codebase Investigation" and "Data-Informed Design" tags pay off.
  3. Numbers: any real counts, percentages, or time frames to show? None get used unless Kyle gives them.
  4. Where it ends: does it land on "the pattern was real" and close out 01 Discovery, or bridge into 02 Diagnosis?
  5. Visual: Beat 3's brief said Beat 4 would be an empty-state montage reusing the hand-drawn circles. Is this that beat, or does the montage belong in 02 Diagnosis ("Tracing every empty state back to its source")?
  Suggested structure to offer again: two beats (the team conversation, then digging in himself, the first ending on what made him start investigating), or one statement beat with two short paragraphs and the investigation finding as a full-screen card overlay like the problem kicker.

### Beat 1 copy (verbatim)
- Title: Diagnosing the problem, not the symptom
- Body: How a few offhand moments on customer calls led to an onboarding framework at Freshpaint.
- Skill tags: Root Cause Analysis, Codebase Investigation, Data-Informed Design, Rapid Prototyping, Cross-Functional Collaboration
- Overlay: none
- Treatment: centered hero like the case study page, at the larger `text-hero` size, "not the symptom" in accent (the case study's two-tone title), sub below, skill tags as centered outlined pills, then the Begin button. No logo, no instruction text. Reveal order: title, sub, tags, Begin.

### Beat 2 copy (verbatim)
- Headline: The problem
- Body: Freshpaint's healthcare marketing analytics platform was powerful, but it had no self-serve system in place to help customers reach the value they'd paid for. Setup flows were confusing and offered little to no guidance. Getting set up correctly meant reading dense documentation or booking a call with CS or an account manager.
- Kicker (next key press, full-screen card overlay): Everyone knew it was an issue. Nobody prioritized fixing it. (Updated by Kyle 2026-10-25.)
- Visual labels: Documentation, CS call, Account manager
- Overlay: none

### Beat 3 copy (verbatim)
- Headline: How it all started (was "A pattern was emerging", then "How this all started"; changed by Kyle 2026-10-25)
- Body 1: We held regular research sessions with a pool of customer accounts. In most of them, customers shared their screen, whether to try a new feature, show us a bug, or walk us through how they used something we'd already released.
- Body 2: Over two days, I sat in on four of these sessions. Each time a customer shared their screen, their Attribution dashboard was only half set up. Some hadn't connected their ad sources, so their spend data never appeared. Others hadn't enabled AI, so Recommendation Cards never showed up. The thread was the same: customers paying for a feature they weren't getting full value from.
- Closing question (full-screen overlay, "or a pattern?" emphasized): Was it a coincidence, or a pattern?
- Visual labels: Day 1, Day 1, Day 2, Day 2; New feature, Bug walkthrough, Adoption check-in, New feature
- Overlay: none

### Beat 4 copy (verbatim): Checking the hunch
- Headline: Checking the hunch
- Body: I brought it up with the team to see if anyone else had noticed. They had. PM and Eng both knew customers struggled to get fully set up. So I asked whether anything was planned to address it. / Nothing was. (rewritten by Kyle 2026-10-25; "Nothing was." on its own line, per Kyle)
- Chat (#team-indigo, divider "After the research sessions"):
  - Kyle Blackman: Noticed something over these past few customer sessions. Seems like almost everyone we spoke to had an Attribution dashboard that was only half set up. Am I crazy? (approved)
  - PM: You're not crazy. Setup has been a known pain point. Even our CEO has called it out. (approved)
  - Eng: Yeah, not surprised honestly. There are a bunch of things that have to be configured before that page shows anything useful. (approved)
  - Kyle Blackman: Got it. Are there any plans to address this in the near future? (approved)
  - PM: Not right now. (approved)

### Beat 5 copy (verbatim): How widespread was it?
- Headline: How widespread was it? (chosen by Kyle)
- Body: Before pushing further, I wanted to know how widespread it was. Our masquerade tool let us see a customer's actual account, populated with their own data, so I used it to look inside roughly 20 of our 200+ customer accounts. I didn't have to dig. Almost every account was either half set up or not set up at all. The fully configured ones were outliers.
- Closing line (own paragraph, accent): And it wasn't one empty state. It was many.
- Montage labels, in order: No events. Events not defined. No ad sources. AI off. AI on, no events. Waiting on data.
- Overlay (auto after the stack, holds for a key press): Six different empty states. Were they evidence of six problems, or just one? (updated by Kyle 2026-10-25)

### 02 Diagnosis copy (verbatim)
Section card: 02 Diagnosis. Tagline: Mapping the flow to see the shape of the problem.

Connecting the dots
- I took a screenshot of every empty state I found. Every time I thought I'd seen them all, another one turned up. A single widget could have several empty states, depending on what was missing. Some seemed to come from the same missing step, and I couldn't tell why.
- I knew my team could explain it, but first I wanted to understand it myself. In FigJam, I used the screenshots as anchor points and mapped the setup flow from start to finish. I filled the space between them with the steps that led there, like Event Creation, linked everything with arrows, and annotated why each point occurred. Anywhere I saw friction, I called it out.

Checking my work
- With the flow mapped as I understood it, I brought it to the team. I wanted to know two things: was I missing any steps, and what caused each empty state?
- Their answers filled the gaps. The biggest surprise was that some empty states weren't indicative of a problem at all. The setup was complete, the account was just waiting on data ingestion. Though nothing communicated that to the user. (Kyle's wording, 2026-10-25)
- With the flow confirmed, I could finally see the full path a customer had to take.
- Counters: Times you left Attribution. Empty states hit.
- Overlay (on a key press after the zoom-out, per Kyle): To set up Attribution properly, a new customer had to leave it three times, find their way back on their own, and push through six empty states. (Option C, chosen by Kyle 2026-10-25: the goal is a fully set-up Attribution, not the first recommendation.)

One problem, not six
- The map answered the question. The empty states weren't six problems. They were one: customers landed in Attribution before they'd had a chance to set it up. As soon as someone created an event, they saw an empty dashboard and were left to fix things on the fly.
- The map also showed what was required and what wasn't. Event Creation and Event Definition (marking events as mid or low funnel) were the only steps needed to see anything, and Attribution only needed a single low-funnel event to work. Connecting ad sources and enabling AI added value, but they were optional.
- That pointed to the fix: front-load setup before users ever see the dashboard. Required steps first, explained clearly. Optional steps last, with the choice to skip them and an easy way back later. And once setup was done, tell users their data was on its way instead of showing them an empty page. (updated by Kyle 2026-10-25)
- Split: Required (Event Creation, Event Definition). Optional (Connect ad sources, Enable AI).

### 03 Approach copy (verbatim)
Section card: 03 Approach. Tagline: Scoping, reusing, testing, and shipping in pieces. (updated 2026-10-25)

Checking before prototyping
- Front-loading setup meant pulling every required step into one guided flow. Whether that was possible would decide how simple the flow could be, so I checked before prototyping anything. ("sketching" changed to "prototyping" by Kyle 2026-10-25: he mapped in FigJam, then went straight to a prototype in Claude Code)
- The biggest question was Event Creation. Its drawer lived on the Events page. If it couldn't move into the new flow, I'd have to design around it.
- Terminal (caption "Reconstructed from my session."): prompts verbatim, responses condensed, as briefed (4 exchanges).

What the code told me
- The drawer was fully self-contained. It had no dependency on the Events page, so surfacing it in Attribution's new setup flow took only a few lines of code, and it could stay in Events for anyone used to creating events there. The investigation also showed that only two fields were required, event name and CSS selector, something the drawer itself never made clear.
- Moving the AI toggle into the flow was also a light lift, so it came along too. Connecting ad sources was heavier and stayed out of v1. Instead, I added an automatic redirect back to Attribution after the OAuth flow finished, so users no longer had to find their way back on their own.
- Status list: Event Creation, moved into the flow (done). Enable AI, moved into the flow (done). Connect ad sources, auto-redirect back (full move planned later) (partial).

Designing for real numbers
- Bringing Event Creation into the flow raised a new problem. Once users created events, they needed a list to review and define them. How long would that list get? I couldn't just design for the happy path.
- All of Freshpaint's data lived in Snowflake, which had an agent layer that let me query it in plain language. I asked how many events users created at three points: during initial setup, after 24 hours, and after 30 days. I looked past day one because of the waiting room, the screen I designed to tell users their data was on its way. It lists every defined event, and some users might not reach it until weeks into setup. I asked for percentiles instead of an average, since an average would hide the edge cases.
- Table: Initial setup and 24 hours / Mostly 1 to 2 events, occasionally a few more. 30 days / Some around 15, outliers 20+. Caption: Approximate ranges.

Two moments, two patterns
- Most users created only one or two events during initial setup, with no sign of anyone creating them in bulk. A simple list covered the majority and could still stretch if needed.
- The waiting room told a different story. The 24-hour numbers barely changed, but by 30 days, users had created more events. For anyone reaching the waiting room weeks into setup, a list would get bulky. So I designed a grid that wraps to a new row after every four events.

Showing my work (headline chosen by Kyle 2026-10-25; split from Two moments, per Kyle)
- Then I stress-tested both. I built a tweaks panel into the prototype that swapped between real customer data loads and updated the UI on the fly. I knew Eng would ask how it scaled, and I wanted to show my work. The panel later became part of our shared prototyping skill, so every new prototype came with one.
- Tweaks panel options: Low (1 event, list), Average (2, list), High (15, grid), Outlier (22, grid). Event names are mock.
