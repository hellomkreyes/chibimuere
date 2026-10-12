# CLAUDE.md

Working notes for chibimuere.com. Read this before changing the site.

## Workflow

- Branch from `main`. If a previous PR is still open, stack only on a branch that won't be deleted on merge, or wait for it to merge. PR #43 closed when its base branch was deleted; don't repeat that.
- Commit messages and PR descriptions follow the attribution lines given in the session.
- Copy and brand data live in `src/content.json`. Don't hard-code copy in `index.html` or `resume.html`.

## Principles

- Accessibility and mobile-first are core. Test at phone width before desktop.
- Personality and interaction are the feature, but never at the cost of keyboard, screen-reader, or reduced-motion users.
- No "AI slop" tells: no eyebrow badges, no numbered labels, no gradient washes, no emoji used as icons.
- Keep the "AI overlords" footer joke.

## Layering (z-index)

- The mobile header (`.site-header`) sits at z 25 below 1140px, so the folded menu falls over the floating view-source (`.source-fab`) and cookie corner (both z 20).
- View-source labels (`.vs-layer-fixed`) stay above the header (z 26).
- Never let a floating control cover a nav link. If a control overlaps, the nav wins.

## Marquee

- Every brand in the marquee uses one type setting: the `.brand-logo` style (the COMPLEX CANADA look). The `style` key in `content.json` is ignored for type.
- The brand list is the single source. Don't reintroduce per-brand fonts.

## Messenger (MSN) block

- In the two-column layout, the display picture (`.msn-pic-them`) stretches to the height of the conversation log beside it.
- Below the single-column breakpoint the picture becomes a 48px chip above its box. Keep the square chip there.

## Custom cursors

- Pointer and disabled states use the custom cursor variables (`--cur-hover`, `--cur-disabled`). Don't fall back to OS cursors on interactive elements.

## QA nitpicks (accessibility and polish)

Logged during QA on the live site. Fix these next time the surface is touched.

- Obscured content: the floating `</>` button covered the mobile menu's CONTACT and RESUME links. Fixed by the layering rule above.
- Disabled CTAs must be real `disabled` buttons with `aria-disabled`, and keep their text readable at 4.5:1 (the struck-through "PUFF PUFF PASS" was too faint).
- Error states must say what happened in text, not colour alone. The broken Dream Blunt Rotation says "broken" in words; keep that when restyling.
- Error red (`#b3263f`-range) on cream and dark panels must meet 4.5:1 for body text (3:1 for large text).
- Speech-bubble copy must not clip at the edge of the viewport on desktop. Check the rotation bubble at 1280px and 1440px wide.
- Links inside the MSN reply line ("contact me") need a visible underline or other non-colour cue.
- Night-mode view-source labels must stay readable over the moving background.

## Testing

- Playwright tests run on chromium and webkit. Visual baselines update via the `update-screenshots` label on the PR.
- Axe checks must pass. Lighthouse and the first-visit budget (50 KB gzipped) must pass.
- Reduced motion: scroll transitions and the rotation jolt must not run. Check with `prefers-reduced-motion: reduce`.
