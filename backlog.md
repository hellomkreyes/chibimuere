# chibimuere backlog

Last updated Oct 1, 2026. Finished items are removed as their PRs land.

`[existing]` = from the original open threads · `[new]` = suggested during the Sep 25 review · `[priority]` = added Sep 28 after the job description review

## Up next
1. Real content via the copy spreadsheet (`site-copy.xlsx`, kept out of git): projects, brands
2. Editions Explorer, as the first real Luna Pie mission (spec: https://claude.ai/code/artifact/57a74e74-a34f-490d-9cce-4177814bac2e)

## Editions Explorer
- [ ] `[priority]` Decide where it lives: a route on this site or its own subdomain (open question in the spec)
- [ ] `[priority]` Retro browser chrome + era skin tokens: 3 skins for the 3 V1 editions, our own browser name and icons, each skin contrast-checked
- [ ] `[priority]` Routes and feature pages from verified JSON (`/editions/<edition>/<tier>/<feature>`), with real deep links in the address bar
- [ ] `[priority]` Motion layer: View Transitions between pages, GSAP era morph on edition switch, loading moments under 400 ms, all with reduced-motion fallbacks. GSAP goes through `animateSection()` in `src/js/motion-controller.js`
- [ ] `[priority]` Keyboard window controls (move, resize, maximize/reader mode) and route announcements
- [ ] `[priority]` Project card + case study linking out to the technical breakdown

## Sections plan (Oct 2026)
Specs, schedule and gates live in the "chibimuere Sections: Technical Plan" doc. Phase 0 (`data-copy-if`, section loader, motion controller, PR checks), the MSN window + winks, the cookie corner, My Pictures (with placeholder art), the Dream Blunt Rotation (with placeholder questions), the Webring (two placeholder entries), and the Dream Collabs ship chart (with placeholder copy) are in.
- [ ] My Pictures: swap the six generated placeholders (and the Thumbs.db one) for real art: originals into `art-originals/`, `npm run images`, captions + alt text in `content.json`, then hide or delete the placeholder entries and their files in `public/art/`
- [ ] Dream Blunt Rotation: M.K. picks which placeholder questions to keep or rewrite (`home.fartsy.rotation` in `content.json`). Eren Yeager is benched (`"show": false`, the table seats eight); real photos or illustrations can replace the emoji avatars later
- [ ] Webring: M.K. fills in the five empty entries in `home.artsy.webring` (fanfic, recipe, podcast, article, creative challenge/event; see the README's Webring section for the fields), adds any other kinds of media as entries, and swaps the two placeholder boosts (Substack, website) for real picks. Real 88x31 button images and site thumbnails can replace the CSS ones later
- [ ] Dream Collabs: M.K. writes the `why` for each of the nine collabs (`home.fartsy.collabs` in `content.json`; each currently says "Placeholder…") and tunes the placeholder tags. All nine are fanon: when one happens, add `"canon": true` and a `"link"` to what you made, and the chart gives it a solid line, a heart and a burst
- [ ] Visitor counter + Cloudflare Worker (site-wide footer). When it ships, update the cookie policy copy in `site.cookie.policy` (the Analytics row says "none" and the body says nothing is counted)

## Content & sections
- [ ] `[new]` Replace the scaffold placeholders with real content: the project cards (Luna Pie is card 01, Mercury RX is card 02; four placeholders to go), the brand names in the marquee, and the resume page copy. Collected in `site-copy.xlsx`
- [ ] `[existing]` 404 page: aesthetic fancy-restaurant washroom easter egg, building on the current 404
- [ ] `[existing]` Redo the CV/Resume teaser on the homepage (there's now a "Read the resume" call to action under the brands marquee)
- [ ] `[new]` Resume page: M.K. reads it over (`resume` in `content.json`, written from the 2024 resume + LinkedIn, facts only). Check the Domaine and Endy wording (verbs like "highlights" are deliberately cautious), say which project the two W3 Awards were for, and decide whether the printed version should keep "Ways of working" (it prints two pages without it). The email is `mkmuere.codes@gmail.com` and the phone number is deliberately left off
- [ ] `[new]` "How this was made" devlog (published on Substack, linked from its card): round notes, M.K.-vs-Claude decisions, what got overruled, the scaffold.html before/after. Could double as Project 01
- [ ] `[new]` Case studies behind the project cards: written up on Substack as technical breakdowns (how it was built, which agent did what, where M.K. overrode them, accessibility + performance calls); the card links out (a Flip-expand preview from the deck could come later)

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
- [ ] `[new]` Turn on branch protection for `main` requiring the four PR checks, once they've run green on a couple of PRs (M.K., in the repo settings; the job names are listed at the top of `.github/workflows/checks.yml`)

## Domain & ops
- [ ] `[new]` Cookie-free analytics, e.g. Cloudflare Web Analytics (works without moving DNS to Cloudflare). When it ships, change the cookie policy's Analytics row to "cookie-free"

## Audit findings (Sep 28)
From the Lighthouse + axe audit of the live site (report: `docs/audits/2026-09-28/report.md`). Scores were 100 for performance, accessibility and best practices, with 0 axe violations; SEO is 63 only because `robots.txt` blocks crawlers on purpose.
- [ ] `[new]` Hand-check color contrast in both themes where axe couldn't decide (text over gradients): `site.name`, the nav and theme-toggle labels, and the `.day-only` / `.night-only` resume text
- [ ] `[new]` Real-device pass on iOS Safari and the Facebook/Instagram in-app browsers, day and night
- [ ] `[new]` Check that link previews still show on Facebook/Instagram with `robots.txt` blocking crawlers (Meta's Sharing Debugger shows what `facebookexternalhit` gets). iMessage builds previews on the sender's device, so it isn't affected
- [ ] `[new]` Find out why day-mode LCP is 5–9× night's (desktop home 279 vs 46 ms, mobile home 1089 vs 224 ms). Same element (`h1.hero-title`), longer render delay in day. No score impact yet
