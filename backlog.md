# chibimuere backlog

Last updated Oct 1, 2026. Finished items are removed as their PRs land.

`[existing]` = from the original open threads · `[new]` = suggested during the Sep 25 review

## Up next
1. Real content via the copy spreadsheet (`site-copy.xlsx`, kept out of git): projects, brands, resume, email
2. Lighthouse + axe audit on the live site

## Sections plan (Oct 2026)
Specs, schedule and gates live in the "chibimuere Sections: Technical Plan" doc. Phase 0 (`data-copy-if`, section loader, motion controller) is in.
- [ ] PR checks workflow: build, Playwright (both themes + reduced motion), axe, screenshot tests, Lighthouse CI. `deploy.yml` stays as is; M.K. turns on branch protection after
- [ ] MSN window revisions + winks (Bio)
- [ ] Cookie corner tab (site-wide). Replaces the parody cookie banner idea and keeps its guardrails: never blocks content, Esc + a real close button, polite announcement, dismissal in localStorage, honors reduced motion
- [ ] My Pictures folder (Artsy), with `scripts/images.js` pre-converting to AVIF + WebP at 1x/2x
- [ ] Dream Blunt Rotation conversation circle (Fartsy)
- [ ] Webring (Artsy)
- [ ] Dream Collabs ship chart (Fartsy)
- [ ] Visitor counter + Cloudflare Worker (site-wide footer)

## Content & sections
- [ ] `[new]` Replace the scaffold placeholders with real content: the project cards (Luna Pie is card 01, Mercury RX is card 02; four placeholders to go), the brand names in the marquee, and the resume page copy. Collected in `site-copy.xlsx`
- [ ] `[existing]` 404 page: aesthetic fancy-restaurant washroom easter egg, building on the current 404
- [ ] `[existing]` Redo CV/Resume teaser
- [ ] `[existing]` Resume page contact still uses the placeholder `hello@chibimuere.example` (button and print version)
- [ ] `[new]` "How this was made" devlog (published on Substack, linked from its card): round notes, M.K.-vs-Claude decisions, what got overruled, the scaffold.html before/after. Could double as Project 01
- [ ] `[new]` Case studies behind the project cards: written up on Substack; the card links out (a Flip-expand preview from the deck could come later)

## Navigation & meta
- [ ] `[new]` One favicon shape: a single butterfly (inspired by the MSN butterfly) for both themes, replacing the day butterfly / night moth pair (`favicon.svg`, `favicon-night.svg`, `favicon.ico`, `apple-touch-icon.png`, and the theme swap in each page's head script)

## GSAP & animation (additive; day ↔ night transitions stay untouched)
- [ ] `[new]` ScrollTrigger + Flip: deal the project deck like tarot cards on scroll
- [ ] `[new]` SplitText / ScrambleText hero entrance: day letters drift in like light, night letters decode like a terminal
- [ ] `[new]` MorphSVG butterfly ↔ moth morph on theme toggle
- [ ] `[new]` One small native moment for breadth: CSS scroll-driven animations or the View Transitions API (resume ↔ home, or into the 404)

## Accessibility
- [ ] `[new]` Check the forced-colors fallback in real Windows High Contrast (the CSS is in; it can't be emulated from macOS): night title visible, panel edges, lit cards outlined
- [ ] `[new]` Screen reader check of the glitch title in VoiceOver and NVDA (the CSS already hides the `data-text` copies; confirm it's read once)

## Personality & easter eggs
- [ ] `[new]` Nudge vibrates on Android (`navigator.vibrate`), gated by the motion toggle
- [ ] `[new]` Auto night after local sunset on first visit, when no preference is saved

## Quality & tooling
- [ ] `[existing]` Run Lighthouse and axe on the deployed site

## Domain & ops
- [ ] `[new]` Cookie-free analytics, e.g. Cloudflare Web Analytics (works without moving DNS to Cloudflare)

## Noted by choice (not a to-do)
- `[existing]` Night hero has no intro paragraph, on purpose
