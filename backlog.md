# chibimuere backlog

Last updated Sep 26, 2026. Finished items are removed as their PRs land.

`[existing]` = from the original open threads · `[new]` = suggested during the Sep 25 review

## Up next
1. Real content via the copy spreadsheet (`site-copy.xlsx`, kept out of git): projects, brands, resume, email
2. Move to chibimuere.com (so og:image and og:url point at the final address)
3. og:image preview (mockups in progress)
4. Lighthouse + axe audit on the live site

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
- [ ] `[existing]` og:image: design a day/night split preview (1200×630 PNG in `public/`), add `og:image` + `og:image:alt` to index.html and resume.html, switch `twitter:card` to `summary_large_image`, and remove the TODO comments. Social meta is already in place (PR 1)

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

## Quality & tooling
- [ ] `[existing]` Run Lighthouse and axe on the deployed site
- [ ] `[new]` Lighthouse CI + axe in Playwright as GitHub Actions (free)
- [ ] `[new]` Playwright screenshot tests for both themes, to protect the transitions
- [ ] `[new]` Move the regex constants out of `scripts/content-plugin.js` (`PAGE_PATTERN`, `COPY_PATTERN`, `ATTR_PATTERN`, `LIST_PATTERN`, `JSON_PATTERN`, `SECTION_PATTERN`, `VAR_PATTERN`) into their own file, e.g. `scripts/content-patterns.js`. Give each one a plain-English comment with an example of the HTML or template text it matches, so future updates don't mean decoding regex

## Domain & ops
- [ ] `[new]` Custom domain chibimuere.com (registered at Hover): point DNS at GitHub Pages (A/AAAA records for the apex, CNAME for www), set the custom domain in the repo's Pages settings, enforce HTTPS, switch Vite `base` to "/", update og:url (and og:image), re-check the 404
- [ ] `[new]` Cookie-free analytics, e.g. Cloudflare Web Analytics (works without moving DNS to Cloudflare)

## Noted by choice (not a to-do)
- `[existing]` Night hero has no intro paragraph, on purpose
