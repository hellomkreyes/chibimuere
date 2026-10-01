# Accessibility & performance audit — 2026-09-28

Live site: https://chibimuere.com/ (home) and https://chibimuere.com/resume.html (resume).

## Summary

- Lighthouse (36 runs: 12 configs × 3 runs, median-per-config by performance score) scored **Performance 1.00, Accessibility 1.00, Best Practices 1.00** on every one of the 12 device/theme/page combinations. **SEO scored 0.63 everywhere**, entirely from the `is-crawlable` audit — this is **by design**, not a defect: `robots.txt` intentionally disallows all crawlers (see Day vs night / SEO note below).
- axe-core found **0 violations** across all 16 completed scans (desktop Chromium, desktop Firefox, tablet Chromium, mobile Chromium × day/night × home/resume). Each scan had 1–2 "incomplete" (needs-manual-review) results, all reducing to two rule types: `color-contrast` and `aria-prohibited-attr`.
- **WebKit axe coverage is missing.** All 8 scheduled WebKit scans (desktop-webkit and tablet-webkit/iPad Pro 11, × day/night × home/resume) failed with a 90-second timeout and were not retried into a successful result. No axe data exists for Safari/WebKit rendering.
- Mobile Safari (iPhone) and the Meta in-app browsers (Facebook/Instagram iOS WKWebView) were **out of scope** for this automated pass by user decision; those need manual, real-device testing.
- Only `index.html` and `resume.html` were audited. `404.html` was not covered by either tool.

## Scope & method

**Tools & versions** (from the harness run, `/tmp/chibimuere-audit/results/summary.json`):
- Lighthouse 13.5.0, run via `chrome-launcher` 1.2.1 against system Chrome 153.0.8010.53.
- axe-core 4.13.0 via `@axe-core/playwright` 4.13.0, Playwright 1.63.0.
- Browser engines used for axe: Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6 (Playwright build v2251 — flagged by Playwright's installer as a "frozen" build for macOS 14, no longer receiving updates).
- Host: macOS 14.6.1 (23G93).

**Matrix**
- Lighthouse: 3 devices (desktop, tablet [custom 834×1194, iPad UA], mobile [Lighthouse default mobile emulation, Pixel-class]) × 2 themes (day, night) × 2 pages (home, resume) × 3 runs each = 36 runs. The run with the median performance score per config was kept as the reported result; all 3 raw per-run performance scores are shown in the results table below where they differ.
- axe: 6 browser/device configs (desktop Chromium, desktop Firefox, desktop WebKit, tablet WebKit [iPad Pro 11], tablet Chromium [custom 834×1194 Android UA], mobile Chromium [Pixel 7]) × 2 themes × 2 pages = 24 scheduled scans, 16 completed.

**Forcing and verifying theme**
- Lighthouse: for each run, a Puppeteer page was connected to the same Chrome instance chrome-launcher started, navigated to the target URL, and had `localStorage.setItem('chibi-theme', theme)` set on it *before* Lighthouse ran. Lighthouse was then invoked with `disableStorageReset: true` and that exact Puppeteer `Page` object passed as its 4th argument, so it audited the same tab/context whose `localStorage` was already seeded. After each run, the harness re-read `document.documentElement.dataset.theme` on that same page to verify the theme actually applied. All 36/36 Lighthouse runs verified `themeMatched: true`.
  - An earlier approach — seeding via a bare CDP connection and letting Lighthouse open its own tab — was tried and discarded: it consistently resolved to "night" regardless of the requested theme, because Lighthouse's own navigation landed in a context that didn't share the seeded `localStorage` and fell back to `prefers-color-scheme` (dark by default in headless Chrome).
- axe: each Playwright context was created with `colorScheme: theme === 'night' ? 'dark' : 'light'` plus an `addInitScript` that sets `localStorage['chibi-theme']` before any page script runs. After load, the harness scrolled the page to the bottom and back (to settle GSAP scroll-reveal content) and re-read `document.documentElement.dataset.theme` to verify. All 16 completed scans verified `themeMatched: true` (0 mismatches).

**Throttling / storage settings (Lighthouse)**
- `throttlingMethod: "simulate"` on every run (confirmed in each report's `configSettings`), i.e. network/CPU throttling is estimated from an unthrottled trace rather than physically throttled. This can understate real-world load times on slow connections/devices compared to `devtoolsThrottling`.
- `disableStorageReset: true` on every run. This is required for the theme-seeding trick above, but it also means Lighthouse did **not** clear cookies/cache/storage before navigating — each Lighthouse run reused whatever Chrome had cached from the theme-seeding page load and cookieless browser state within that same process. Runs are still cheap "cold enough" in practice (fresh `chrome-launcher` process per run), but this is a caveat: results may reflect a slightly warmer cache than a fully clean Lighthouse run would.

**Excluded, and why**
- Mobile Safari (iPhone WebKit) and Meta in-app browsers (Facebook/Instagram iOS WKWebView) — excluded by user decision; the user will test these manually on a real device.
- `404.html` — not included in either the Lighthouse or axe matrix (only home and resume were audited).
- Desktop/tablet WebKit axe scans were scheduled but did not complete (see Coverage gaps).

## Lighthouse results

All scores are the median-run value per config (0–1 scale, shown as a percentage). Metrics are the median run's raw values, rounded.

| Device | Theme | Page | Perf | A11y | BP | SEO | LCP (ms) | CLS | TBT (ms) |
|---|---|---|---|---|---|---|---|---|---|
| Desktop | Day | Home | 100 | 100 | 100 | 63 | 279 | 0 | 60 |
| Desktop | Day | Resume | 100 | 100 | 100 | 63 | 238 | 0 | 0 |
| Desktop | Night | Home | 100 | 100 | 100 | 63 | 46 | 0 | 0 |
| Desktop | Night | Resume | 100 | 100 | 100 | 63 | 31 | 0 | 0 |
| Tablet | Day | Home | 100 | 100 | 100 | 63 | 1089 | 0 | 47 |
| Tablet | Day | Resume | 100 | 100 | 100 | 63 | 788 | 0 | 33 |
| Tablet | Night | Home | 100 | 100 | 100 | 63 | 187 | 0 | 52 |
| Tablet | Night | Resume | 100 | 100 | 100 | 63 | 84 | 0 | 0 |
| Mobile | Day | Home | 100 | 100 | 100 | 63 | 1089 | 0 | 0 |
| Mobile | Day | Resume | 100 | 100 | 100 | 63 | 788 | 0 | 0 |
| Mobile | Night | Home | 100 | 100 | 100 | 63 | 224 | 0 | 0 |
| Mobile | Night | Resume | 100 | 100 | 100 | 63 | 107 | 0 | 0 |

All 12 median configs scored Performance 100, Accessibility 100, Best Practices 100, SEO 63.

**Per-run performance score variance** (all 3 raw runs per config; only shown where they differ — every config had all 3 runs at performance 1.00 except one):
- `mobile-night-resume`: run 1 = 1.00, run 2 = 0.96, run 3 = 1.00. Median (middle value when sorted) = 1.00, so the reported config uses run 1's report. The single 0.96 run is noise-level variance on a "simulate"-throttled run and did not affect the median.

All other 11 configs had performance 1.00 on all 3 runs each (36 runs total, 35 at 1.00 and 1 at 0.96).

## Lighthouse failing / warning audits

Deduplicated across all 12 configs — accessibility and best-practices had **zero** failing audits anywhere. Performance had no failing audits or flagged opportunities in any config (`topPerfOpportunities` empty in all 12 median reports).

| Audit | Category | Result | Configs affected | Notes |
|---|---|---|---|---|
| `is-crawlable` — "Page is blocked from indexing" | SEO | Failing (score 0) | All 12 (every device × theme × page) | Caused by `robots.txt`: `User-agent: *` / `Disallow: /`, under the comment `# Do not crawl or index this site.` (robots.txt lines 1–3). This is intentional — the site owner does not want the site crawled or indexed. Not a defect; see recommendations. |

No other SEO audits failed. No performance, accessibility, or best-practices audits failed or were flagged as warnings in any of the 36 runs.

## axe-core results

16 of 24 scheduled scans completed. All 16 had **0 violations**.

| Config | Theme | Page | Violations | Passes | Incomplete | Theme verified |
|---|---|---|---|---|---|---|
| desktop-chromium | Day | Home | 0 | 35 | 2 | Yes |
| desktop-chromium | Day | Resume | 0 | 33 | 1 | Yes |
| desktop-chromium | Night | Home | 0 | 35 | 2 | Yes |
| desktop-chromium | Night | Resume | 0 | 33 | 1 | Yes |
| desktop-firefox | Day | Home | 0 | 35 | 2 | Yes |
| desktop-firefox | Day | Resume | 0 | 33 | 1 | Yes |
| desktop-firefox | Night | Home | 0 | 35 | 2 | Yes |
| desktop-firefox | Night | Resume | 0 | 33 | 1 | Yes |
| desktop-webkit | Day/Night | Home/Resume (×4) | — | — | — | **No data — timed out** |
| tablet-chromium | Day | Home | 0 | 34 | 2 | Yes |
| tablet-chromium | Day | Resume | 0 | 32 | 1 | Yes |
| tablet-chromium | Night | Home | 0 | 34 | 2 | Yes |
| tablet-chromium | Night | Resume | 0 | 32 | 1 | Yes |
| tablet-webkit (iPad Pro 11) | Day/Night | Home/Resume (×4) | — | — | — | **No data — timed out** |
| mobile-chromium | Day | Home | 0 | 34 | 2 | Yes |
| mobile-chromium | Day | Resume | 0 | 32 | 1 | Yes |
| mobile-chromium | Night | Home | 0 | 34 | 2 | Yes |
| mobile-chromium | Night | Resume | 0 | 32 | 1 | Yes |

**"Incomplete" (needs manual review) items**, deduped by rule id, from the 16 completed scans:

1. **`aria-prohibited-attr`** — "Elements must only use permitted ARIA attributes." 1 node, selector `.brands`. Appears only on **home** pages (not resume), in both themes, across all 4 browser/device configs that completed (desktop-chromium, desktop-firefox, tablet-chromium, mobile-chromium). Needs a manual check of which ARIA attribute is present on `.brands` and whether it's valid for that element's implicit role.
2. **`color-contrast`** — "Elements must meet minimum color contrast ratio thresholds." Flagged as *incomplete* (axe couldn't fully resolve contrast automatically — commonly because of a background gradient, image, or transparency), not a confirmed violation. Appears on **every** completed scan (home and resume, day and night, all 4 completed configs). Node counts vary a lot by config/theme/page — from 11 nodes (mobile-chromium night-resume) up to 34 nodes (desktop-chromium/firefox day-home). Sample flagged selectors: `span[data-copy="site.name"]`, `span[data-copy="site.nav.bio.label"]`, `span[data-copy="site.theme.toNight"]` / `site.theme.toDay"]`, and on resume pages also `.day-only` / `.night-only`. This needs a manual contrast check (e.g. against the actual rendered background) for the flagged elements in both themes, since the automated tool couldn't resolve it.

No other incomplete rule ids were found in the completed scans.

## Day vs night differences

- **Lighthouse scores**: identical across day and night for every device/page — Performance, Accessibility, Best Practices, and SEO all match between themes. LCP (median, ms) is consistently higher in day mode than night in every one of the 6 device/page pairs: desktop home 279 vs 46, desktop resume 238 vs 31, tablet home 1089 vs 187, tablet resume 788 vs 84, mobile home 1089 vs 224, mobile resume 788 vs 107. All values remain well within Lighthouse's "good" LCP threshold (<2500 ms), and Performance still scores 100 in every config. This audit did not determine the cause — it could be a different LCP element or asset behaving differently in day mode. A spot check of the desktop-home median reports (`largest-contentful-paint-element`/`lcp-breakdown-insight` in `desktop-day-home-run2.report.json` vs `desktop-night-home-run2.report.json`) found the LCP element is the *same* in both themes (`h1.hero-title`, "chibi muere"), with near-identical time-to-first-byte (2.1 ms day vs 2.3 ms night); the day/night gap there is driven by a longer element-render delay in day mode (327.7 ms vs 191.6 ms), not a different element or resource. This was only checked for the one desktop-home pair, not all six.
- **axe violations**: 0 in both themes on every completed config — no theme-specific violations found.
- **axe incomplete node counts**: `color-contrast` incomplete-node counts differ by theme at the same device/page (e.g. desktop-chromium home: 34 nodes in day vs 24 in night; desktop-chromium resume: 14 in day vs 13 in night), and the specific flagged selectors differ (day flags `.day-only` / `site.theme.toNight`, night flags `.night-only` / `site.theme.toDay`) — expected, since the day/night-only elements swap visibility. `aria-prohibited-attr` is theme-independent (flags `.brands` on home in both themes).
- **SEO 0.63**: identical in both themes — the `is-crawlable` failure comes from `robots.txt`, which is theme-independent.

## Coverage gaps

- **WebKit axe scans are entirely missing.** All 8 scheduled scans (desktop-webkit "Desktop WebKit" device profile × day/night × home/resume, and tablet-webkit "iPad Pro 11" device profile × day/night × home/resume) failed with `TIMEOUT after 90000ms`, hanging at `context.newPage()`/navigation. A retry attempt also timed out without producing results. Diagnosed cause (from the harness run): a Playwright WebKit/macOS 14.6.1 host incompatibility — `playwright install` warned that the installed WebKit build is a "frozen" build no longer receiving updates on macOS 14, and a standalone repro confirmed `webkit.launch()`/`newContext()` succeed but `context.newPage()` hangs indefinitely on this host, unrelated to chibimuere.com itself. **No axe accessibility data exists for Safari/WebKit rendering** — Safari-specific rendering/AT quirks (VoiceOver + Safari is a common real-world pairing) are unverified.
- **Mobile Safari (iPhone) and Meta in-app browsers (Facebook/Instagram iOS WKWebView)** were out of scope for this automated pass by user decision. These need manual, real-device testing in both day and night themes.
- **`404.html` was not audited** by either Lighthouse or axe — only `index.html` and `resume.html` were in the matrix.
- Lighthouse used `throttlingMethod: "simulate"` (estimated, not physical, throttling) and `disableStorageReset: true` (see Scope & method caveat above) — results should be read as a good relative signal, not an exact real-network measurement.

## Findings & recommendations

1. **[info] SEO score of 0.63 is expected and by design.** `robots.txt` (lines 1–3) intentionally disallows all crawlers under the comment "Do not crawl or index this site." The `is-crawlable` audit fails everywhere as a direct, correct consequence. No action needed unless the site owner's intent changes.
2. **[moderate] `color-contrast` needs manual review on every page/theme.** axe could not automatically resolve contrast for text over what's likely a gradient or image background (`site.name`, nav/theme-toggle labels, and `.day-only`/`.night-only` resume elements), in both day and night, on every completed browser. This is *not* a confirmed violation, but the volume (11–34 flagged nodes per scan) and the fact it recurs on both pages/themes/all 4 completed browsers means it needs an actual manual contrast check to close out.
3. **[moderate] `aria-prohibited-attr` on `.brands` needs manual review.** One node on the home page (both themes, all 4 completed browsers) has an ARIA attribute axe considers not permitted for its role. Needs a look at the markup to confirm whether it's a real issue or a false positive for that element's role.
   - **Follow-up (same day):** real issue. `.brands` was a plain `<div>` with `aria-label`, and ARIA prohibits naming an element with no role. Fixed by adding `role="group"` (`index.html`); a local axe re-run now passes `aria-prohibited-attr` in both themes.
4. **[serious] WebKit accessibility coverage is missing.** No axe results exist for Safari/WebKit rendering (desktop or iPad) due to a local Playwright/macOS host timeout issue, unrelated to the site. Given Safari + VoiceOver is a common real assistive-tech pairing, this is a real coverage gap, not just a nice-to-have re-run.
5. **[minor] `404.html` was never audited.** Neither tool covered the 404 page; it should go through the same Lighthouse + axe matrix once it's not just a placeholder.
6. **[info] Verify link-preview (Open Graph) rendering on Facebook/Instagram/iMessage.** `robots.txt` disallows `User-agent: *` (and additionally lists `Meta-ExternalAgent`) with `Disallow: /`. It's unverified whether the crawlers Facebook/Instagram/iMessage actually use for link-preview unfurling (typically `facebookexternalhit`) respect this blanket disallow and whether that would suppress Open Graph preview cards when the site is shared. This is a question to verify, not a confirmed problem.
7. **[info] Lighthouse performance/accessibility/best-practices are clean.** All 36 runs scored 1.00 (aside from one isolated 0.96 run-to-run outlier on mobile-night-resume that didn't affect any median). No failing or flagged performance opportunities were reported in any of the 12 median configs. No action needed at this time.
8. **[info] Day mode LCP is consistently higher than night.** LCP is higher in day mode across all 6 device/page pairs (e.g. desktop home 279 ms vs 46 ms, mobile home 1089 ms vs 224 ms) — see Day vs night differences. No score impact: Performance is still 100 everywhere and LCP stays in the "good" range throughout. Cause not determined by this audit.
9. **[info] Unscored Lighthouse insights.** The same 12 configs also flag four insights that don't affect any score (found in the per-config HTML reports):
   - **Cache lifetimes** (all pages): GitHub Pages serves the CSS, JS and fonts with a 10-minute cache, which can't be changed on Pages.
   - **Render-blocking requests** (all pages, flagged hardest at night): the main stylesheet blocks first paint.
   - **Network dependency tree** (day pages): Space Mono 700 isn't preloaded, so it waits for the CSS (longest chain 124 ms on mobile).
   - **Forced reflow** (day home on all devices, night home on tablet): the main script reads layout during start-up, about 93 ms on mobile.

## Follow-up (Oct 1)

The PR checks workflow (`.github/workflows/checks.yml`) now runs Playwright + axe on every PR in Chromium, WebKit and a mobile Chromium profile, including `404.html`, which closes findings 4 and 5 for future changes. Lighthouse CI runs on every PR with the budgets from the sections plan.
