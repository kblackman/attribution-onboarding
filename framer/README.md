# Framer setup: page transition from the deck's "View All Work"

The deck runs inside an embed on the Framer case study page. When it's embedded, its "View All Work" links
(the header, the compact pill, and the end-of-story button) ask the Framer page to navigate home instead of
loading the homepage themselves. That way Framer's page transition plays. This override is the part on the
Framer page that answers. Without it, the links still work. They just load the homepage with no transition.

## Steps (once, on the attribution-onboarding page)

1. **Add the override file.** In Framer, open **Assets → Code → + → New Override**. Name it
   `DeckNavigation`. Replace everything in it with the contents of `withDeckNavigation.tsx`, then save.
2. **Add a hidden link.** On the case study page, add a small Text layer, for example "View All Work".
   - In the right panel, add a **Link** to the Home page.
   - Set the **transition** you use on your other case study links.
3. **Hide it without removing it.** Set the layer's **Opacity to 0** and its size to about 1×1. Put it
   anywhere, for example a corner of the page.
   - Don't use Framer's "Visible" toggle. A hidden layer isn't on the page, so the override can't click it.
4. **Attach the override.** With that layer selected, go to **Code Overrides** in the right panel. Pick
   File: `DeckNavigation`, Override: `withDeckNavigation`.
5. **Publish, then test on the live page.** Click Begin, then View All Work. The page transition should play
   on the way home.

## Notes

- The override only listens to messages from `https://kblackman.github.io`, where the deck is hosted. If the
  deck ever moves, change `DECK_ORIGIN` at the top of the file.
- The hidden link is skipped by Tab and hidden from screen readers. The deck's own visible links are the ones
  people use.
- To test in Framer's preview, the deck has to come from the live GitHub Pages address, which it already does.
