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
