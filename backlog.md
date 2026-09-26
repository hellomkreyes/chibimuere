# chibimuere backlog

Last updated Sep 25, 2026. Finished items are removed as their PRs land.

`[existing]` = from the original open threads · `[new]` = suggested during the Sep 25 review

## Content & sections
- [ ] `[existing]` 404 page: aesthetic fancy-restaurant washroom easter egg, building on the current 404
- [ ] `[existing]` Redo CV/Resume teaser
- [ ] `[existing]` Redo Dream Collabs
- [ ] `[existing]` Redo Dream Blunt Rotation
- [ ] `[existing]` Flesh out the Artsy and Fartsy placeholder sections
- [ ] `[existing]` Resume page contact still uses the placeholder `hello@chibimuere.example` (button and print version)
- [ ] `[new]` "How this was made" page or night-mode devlog: round notes, M.K.-vs-Claude decisions, what got overruled, the scaffold.html before/after. Could double as Project 01
- [ ] `[new]` Case studies behind the project cards (Flip-expand from the deck)

## Navigation & meta
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

## Mobile-first
- [ ] `[new]` Header clips below 320px wide: the night "RETURN TO DAY" toggle gets cut off (seen at 290px). Wordmark + menu + toggle need ~296px even at 12px, so shorten the label, stack, or shrink them on the narrowest screens. 320px (WCAG reflow) already fits

## Personality & easter eggs
- [ ] `[new]` `console.log` greeting and an ASCII art comment in view-source
- [ ] `[new]` Nudge vibrates on Android (`navigator.vibrate`), gated by the motion toggle
- [ ] `[new]` Auto night after local sunset on first visit, when no preference is saved

## Quality & tooling
- [ ] `[existing]` Run Lighthouse and axe on the deployed site
- [ ] `[new]` Lighthouse CI + axe in Playwright as GitHub Actions (free)
- [ ] `[new]` Playwright screenshot tests for both themes, to protect the transitions

## Domain & ops
- [ ] `[new]` Cloudflare domain: CNAME, enforce HTTPS, update the Vite `base` when moving off `/chibimuere/`, and re-check the 404
- [ ] `[new]` Cloudflare Web Analytics (free, cookie-free)

## Noted by choice (not a to-do)
- `[existing]` Night hero has no intro paragraph, on purpose
