# Tech Debt

Running log of known debt. Add entries as you find them; remove when fixed.

**Format per entry:**
- **Title** — short handle for the issue
- **Area** — affected package/path
- **What & why** — what's wrong and why it matters
- **Suggested fix** — the preferred shape of the cleanup
- **Discovered** — date (YYYY-MM-DD)

---

## AvatarCircle duplicated between `/down` and `/common`

- **Area:** `down/components/AvatarCircle.tsx` vs `common/src/components/AvatarCircle/index.native.tsx`
- **What & why:** The RN app has its own `AvatarCircle` in `down/components/` that duplicates the one in `@down/common`. All other RN screens import the local copy, so behavior changes have to be made in two places. Violates CLAUDE.md §4 (shared logic lives in common) and §13 (never duplicate types/components).
- **Suggested fix:** Delete `down/components/AvatarCircle.tsx`, re-export `AvatarCircle` from `down/components/index.ts` via `@down/common`, and update any callers that rely on RN-local behavior (e.g. `randomTilt` default). Verify the native file-extension resolution (`.native.tsx`) picks up correctly in the Expo bundler.
- **Discovered:** 2026-04-20

---

## Status/RSVP colors not dark-mode aware on web

- **Area:** `common/src/components/EventCard/index.web.tsx`
- **What & why:** RSVP chip and status badge colors are hardcoded as arbitrary Tailwind values (`bg-[#FFEFC7]`, `bg-[#D8F8E7]`, etc.) and bypass the CSS variable theme system. They won't change in dark mode.
- **Suggested fix:** Move these into CSS variable tokens (add to `globals.css` `:root` / `.dark` and define them in `tailwind.config.ts`), then replace arbitrary values with semantic classes.
- **Discovered:** 2026-04-20

---

## `aspect-square` cards are excessively tall on single-column mobile

- **Area:** `common/src/components/EventCard/index.web.tsx`, `web/components/GroupCard.tsx`
- **What & why:** Cards use `aspect-square` unconditionally. On `grid-cols-1` (mobile), the card fills the full content-area width, making each card ~350px tall. This is a poor experience on phones — cards should only be square when there are 2+ columns.
- **Suggested fix:** Replace `aspect-square` with `sm:aspect-square` on both cards so the constraint only applies at the `sm` breakpoint and above.
- **Discovered:** 2026-04-20

---

## `aspect-square` placement inconsistency between EventCard and GroupCard

- **Area:** `common/src/components/EventCard/index.web.tsx` vs `web/components/GroupCard.tsx`
- **What & why:** GroupCard correctly puts `aspect-square` on the outer wrapper (`<Link>`), which constrains the grid cell. EventCard puts it on the inner `<Card>` element, which can cause height to be driven by content rather than the grid cell in some browsers.
- **Suggested fix:** Move `aspect-square` from `<Card>` to the outer `<button>` wrapper in EventCard, matching the GroupCard pattern.
- **Discovered:** 2026-04-20

---

## `ThemeContext.isDark` is wrong on first render

- **Area:** `web/components/ThemeProvider.tsx`
- **What & why:** `isDark` initializes to `false`. The anti-FOUC script correctly sets the `dark` class on `<html>` before paint, so CSS is fine. But any component reading `useTheme().isDark` in JS will see `false` on the first render even in dark mode, until the `useEffect` fires.
- **Suggested fix:** Initialize lazily: `useState(() => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'))`. This syncs React state with the class already applied by the anti-FOUC script from the first render.
- **Discovered:** 2026-04-20

---

## Dashboard fetches events with N+1 `fetchEvents()` calls per group

- **Area:** `web/app/(app)/dashboard/page.tsx`
- **What & why:** The dashboard calls `fetchGroups`, then maps over every group and calls `fetchEvents(supabase, group.id)` in parallel — one Edge Function request per group. 10 groups = 10 requests per page load. CLAUDE.md §11 and §14 flag this pattern explicitly.
- **Suggested fix:** Add a `fetchAllEventsForUser` Edge Function that returns all events across the user's groups in a single query, and replace the fan-out loop in the dashboard.
- **Discovered:** 2026-04-20

---

## Pill accent colors not dark-mode aware

- **Area:** `web/tailwind.config.ts`, any component using `pill-*` classes
- **What & why:** Category pill colors (`pill-food`, `pill-drinks`, etc.) are hardcoded hex values in the Tailwind config and don't switch with the theme.
- **Suggested fix:** Add `pill-*` color pairs to `globals.css` under `:root` and `.dark` as CSS variables, then reference them in `tailwind.config.ts` via `rgb(var(--color-pill-*) / <alpha-value>)`.
- **Discovered:** 2026-04-20

---

## `NewMenu` JSX helper defined inside layout render function

- **Area:** `web/app/(app)/layout.tsx`
- **What & why:** The `NewMenu` component is defined as a function inside `AppLayout`, so React treats it as a new component type on every render and fully unmounts/remounts its subtree each time.
- **Suggested fix:** Move `NewMenu` outside `AppLayout` to module scope and pass handlers as props.
- **Discovered:** 2026-04-20
