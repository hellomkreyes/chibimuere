# chibimuere backlog

Last updated Sep 27, 2026. Finished items are removed as their PRs land.

`[existing]` = from the original open threads · `[new]` = suggested during the Sep 25 review

## Up next
1. Real content via the copy spreadsheet (`site-copy.xlsx`, kept out of git): projects, brands, resume, email
2. Lighthouse + axe audit on the live site

## Content & sections
- [ ] `[new]` Replace the scaffold placeholders with real content: the project cards (Luna Pie is card 01; five placeholders to go), the brand names in the marquee, and the resume page copy. Collected in `site-copy.xlsx`
- [ ] `[existing]` 404 page: aesthetic fancy-restaurant washroom easter egg, building on the current 404
- [ ] `[existing]` Redo CV/Resume teaser
- [ ] `[existing]` Redo Dream Collabs
- [ ] `[existing]` Redo Dream Blunt Rotation
- [ ] `[existing]` Flesh out the Artsy and Fartsy placeholder sections
- [ ] `[existing]` Resume page contact still uses the placeholder `hello@chibimuere.example` (button and print version)
- [ ] `[new]` "How this was made" devlog (published on Substack, linked from its card): round notes, M.K.-vs-Claude decisions, what got overruled, the scaffold.html before/after. Could double as Project 01
- [ ] `[new]` Case studies behind the project cards: written up on Substack; the card links out (a Flip-expand preview from the deck could come later)

## Navigation & meta
- [ ] `[new]` One favicon shape: a single butterfly (inspired by the MSN butterfly) for both themes, replacing the day butterfly / night moth pair (`favicon.svg`, `favicon-night.svg`, `favicon.ico`, `apple-touch-icon.png`, and the theme swap in each page's head script)

## GSAP & animation (additive; day ↔ night transitions stay untouched)
- [ ] `[new]` Central motion controller with `gsap.matchMedia()` tied to `prefers-reduced-motion` and the Pause Motion toggle (do this first)
- [ ] `[new]` ScrollTrigger + Flip: deal the project deck like tarot cards on scroll
- [ ] `[new]` SplitText / ScrambleText hero entrance: day letters drift in like light, night letters decode like a terminal
- [ ] `[new]` MorphSVG butterfly ↔ moth morph on theme toggle
- [ ] `[new]` One small native moment for breadth: CSS scroll-driven animations or the View Transitions API (resume ↔ home, or into the 404)

## Accessibility
- [ ] `[new]` Check the forced-colors fallback in real Windows High Contrast (the CSS is in; it can't be emulated from macOS): night title visible, panel edges, lit cards outlined
- [ ] `[new]` Screen reader check of the glitch title in VoiceOver and NVDA (the CSS already hides the `data-text` copies; confirm it's read once)

## Personality & easter eggs
- [ ] `[new]` `console.log` greeting and an ASCII art comment in view-source
- [ ] `[new]` Nudge vibrates on Android (`navigator.vibrate`), gated by the motion toggle
- [ ] `[new]` Auto night after local sunset on first visit, when no preference is saved
- [ ] `[new]` Parody cookie banner: looks like the usual consent pop-up but says the site has no cookies (e.g. "We use 0 cookies 🍪" with "Accept" / "Also accept" buttons, and a night-theme variant). It's a joke, not a real consent flow: it never blocks content, dismisses with Esc and a real close button, is announced politely to screen readers, stores the dismissal in localStorage (so the joke stays true), and honors reduced motion. Pairs with the cookie-free analytics item

## Quality & tooling
- [ ] `[existing]` Run Lighthouse and axe on the deployed site
- [ ] `[new]` Lighthouse CI + axe in Playwright as GitHub Actions (free)
- [ ] `[new]` Playwright screenshot tests for both themes, to protect the transitions

## Domain & ops
- [ ] `[new]` Cookie-free analytics, e.g. Cloudflare Web Analytics (works without moving DNS to Cloudflare)

## Noted by choice (not a to-do)
- `[existing]` Night hero has no intro paragraph, on purpose
