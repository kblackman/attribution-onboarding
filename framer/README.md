# Framer setup: the deck's header links on the case study page

The deck runs inside an embed on the Framer case study page, so its header is the deck's own, not Framer's.
When it's embedded, its links ask the Framer page to do the job instead of doing it themselves:

- **View All Work** (the header link, the logo, the compact pill, and the end-of-story button) asks Framer to
  navigate home, so your page transition plays.
- **Get In Touch** (the header button and the end-of-story button) asks Framer to open your contact modal.

The overrides in `withDeckNavigation.tsx` are the part on the Framer page that answers. Without them the links
still work: View All Work loads the homepage with no transition, and Get In Touch goes to LinkedIn.

## Steps (on the attribution-onboarding page)

1. **Update the override file.** In Framer, select the hidden View All Work link and click **Edit code** under
   Code overrides. The file is named `Home_Link`. Replace everything in it with the contents of
   `withDeckNavigation.tsx`, then save. The file now has two overrides: `withDeckNavigation` and
   `withDeckContact`. The first one is unchanged, so the View All Work link you set up already keeps working.
2. **Add a hidden copy of the site header.** Copy the whole header from another page (the homepage, for
   example), not just its Get In Touch button: the contact modal is wired to the header, so a button on its own
   opens nothing. Paste it onto this page. If you pasted only the button before, delete it.
3. **Hide it without removing it.** Set the header's **Opacity to 0**. The override lets clicks pass through
   it, so it won't block the deck.
   - Don't use Framer's "Visible" toggle. A hidden layer isn't on the page, so the override can't press it.
4. **Attach the override.** With the header selected, go to **Code Overrides** in the right panel. Pick
   File: `Home_Link`, Override: `withDeckContact`. It finds the Get In Touch button inside the header.
5. **Publish, then test on the live page.** Click Get In Touch in the deck's header: the contact modal should
   open over the case study. Click Begin, go to the last screen, and try its Get In Touch too.

The View All Work setup from before stays as it was: a hidden link to Home with your transition, opacity 0,
override `withDeckNavigation`.

## Notes

- The overrides only listen to messages from `https://kblackman.github.io`, where the deck is hosted. If the
  deck ever moves, change `DECK_ORIGIN` at the top of the file.
- The hidden layers are skipped by Tab and hidden from screen readers. The deck's own visible links are the ones
  people use.
- If Get In Touch still goes to LinkedIn after publishing, the override isn't answering: check that the hidden
  header is on this page, at opacity 0 rather than hidden, with `withDeckContact` attached. If clicking does nothing at all, the hidden layer doesn't carry the
  modal interaction (a lone button doesn't; the header does).
- To test in Framer's preview, the deck has to come from the live GitHub Pages address, which it already does.
  The deck side has to be pushed first.
