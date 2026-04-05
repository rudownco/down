# R u Down? — Product & Engineering Context

## Overview
"R u Down?" is a social planning app designed to make coordinating events within friend groups fast, clear, and low-effort.

### Core Problem
Group chats are inefficient for planning:
- Messages get buried
- Responses are unclear or inconsistent
- It's hard to quickly determine who is actually attending

### Solution
Provide structured, lightweight coordination using:
- Groups
- Events
- Clear RSVP signals
- Poll-based scheduling

---

## Core Features

### 1. Groups
Users can create and participate in multiple groups.

#### Roles

**Note** - Permissions will be a hierarchy. A role will "inherit" the permissions of the roles below it.

- **Owner** — Manage the group settings (include Transferring ownership to someone else, by default Owner role be the initial creator of group), promote Member -> Admin
- **Admin** — Invite/Remove Members, create/edit Events, promote Initiate -> Member, lock the winning time on an event (advancing it from voting → confirmed)
- **Member** - Suggest Times on Events
- **Initiate** — Can view events, vote on times, and RSVP

---

### 2. Events
Events exist within groups and represent planned activities.

#### Event Fields
- Name
- Description
- Location
- Proposed Times (poll-based)
- Creator
- Associated Group

---

### 3. Time Polling (Core Feature)
- Users (including invitees) can suggest multiple time options
- Group members vote on preferred times
- System surfaces the most popular option clearly

---

### 4. RSVP System
Each user responds to an event with:
- ✅ Down
- 🤔 Maybe...
- ❌ Flaking

Requirements:
- Responses must be real-time, easily changeable, and clearly visible

---

### 5. Real-Time Updates
- RSVP updates propagate instantly using Supabase Realtime
- UI reflects live participation without refresh

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native (Expo) |
| Web (planned) | Next.js |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| Server Logic | Supabase Edge Functions |
| Styling | NativeWind (Tailwind for RN) |

---

## Cross-Platform Strategy ⚠️ IMPORTANT

We support **mobile (React Native/Expo)** and **web (Next.js)**.

**Goal:** Never duplicate logic across platforms.

**Rule:** If logic works the same on both platforms, it belongs in `/common`. Platform files are the exception, not the default.

The `/common` package (`@down/common`) is the source of truth for:
- **Types** — domain types only (never raw Supabase types like `user_metadata`)
- **Profiles** — user-facing identity fields are read from `profiles` / domain `User`, not `user_metadata` (see §18)
- **Permissions** — role → capability maps in `/common/src/utils/permissions.ts`, mirrored to Edge Functions `_shared/permissions.ts` (see §19–20)
- **Enumerations** — fixed product values as `as const` arrays in common, types derived from them (see §21)
- **API functions** — all Supabase Edge Function calls
- **Hooks** — shared React hooks (e.g. `useAuthState`)
- **Utils** — formatting, emoji, greeting, etc.
- **UI components** — with platform file extensions (`.native.tsx` / `.web.tsx`)

Platform-specific code lives only in `/down` (RN) or `/web` (Next.js) and is limited to:
- Navigation (Expo Router vs Next.js router)
- Platform auth extras (e.g. `expo-web-browser` for Google sign-in on RN)
- Platform-specific storage or APIs

---

## Project Structure

```
/down
  /common        ← Shared package (@down/common)
    /src
      /types     ← Domain types (User, DownGroup, EventSuggestion, etc.)
      /services  ← Supabase client factory + all API functions
      /hooks     ← Shared React hooks (useAuthState, etc.)
      /utils     ← Formatting, emoji, greeting, etc.
      /components← Shared UI (platform file extensions)
      /theme     ← Design tokens
  /down          ← React Native (Expo) app
    /app         ← Expo Router screens
    /components  ← RN-only UI components
    /src
      /context   ← Auth context (wraps shared useAuthState)
      /stores    ← Zustand stores
  /web           ← Next.js web app
    /app         ← Next.js App Router pages
    /components  ← Web-only UI components (wraps shared useAuthState)
    /lib         ← Web-only utilities (supabase client, inviteToken)
  /ios           ← Legacy Swift app (archived)
  CLAUDE.md
```

---

## Architecture Principles

### 1. Separation of Concerns
Keep these clearly separated:
- **UI** — presentation only, no business logic
- **Business logic** — hooks, stores, utilities (in `/common` if shared)
- **Data fetching** — all Supabase calls live in `/common/src/services/api.ts`

### 2. Backend = Supabase Edge Functions Only ⚠️ CRITICAL

**ALL backend logic lives in Supabase Edge Functions. Period.**

- Never create Next.js API routes (`/api/*`)
- Never create Next.js Server Actions
- Never use `@supabase/ssr` or cookie-based server clients
- Never use Next.js Server Components for data fetching
- The Next.js app is a pure client-side frontend that calls Edge Functions

This keeps backend logic platform-agnostic and reusable by both RN and web.

### 3. Domain Types, Not Supabase Types ⚠️ CRITICAL

**UI components and pages must only use domain types from `@down/common`, never raw Supabase types.**

- Never pass `user.user_metadata` to a component — map it to a domain `User` first (profile fields come from `profiles`; see §18)
- Never pass Supabase response shapes directly to UI — map them in the API layer
- The mapping happens once, in `/common/src/services/api.ts` or `/common/src/hooks/useAuthState.ts`
- UI components receive clean domain types: `User`, `DownGroup`, `EventSuggestion`, etc.

### 4. Shared Hooks Before Platform-Specific Code

Before writing a hook in `/down` or `/web`, ask: does this logic work the same on both platforms?

If yes → write it in `/common/src/hooks/` and import it everywhere.

Examples of what belongs in common:
- Auth state management (`useAuthState`)
- Data fetching hooks
- Business logic hooks

Platform wrappers are thin: they add navigation or platform APIs, then delegate to the shared hook.

### 5. Core Domains
Structure code around these domains:
- `users`
- `groups`
- `events`
- `time_options`
- `rsvps`

### 6. Database Design
Entities:
- `users`
- `profiles`
- `groups`
- `group_users`
- `events`
- `event_time_options`
- `event_time_votes`
- `rsvps`

Optimize queries for:
- Fetching events by group
- Fetching RSVPs by event
- Fetching time votes per event

### 7. API Design
- Small, composable Edge Functions
- Avoid "do everything" endpoints
- Prefer explicit over implicit

### 8. Real-Time Strategy
Subscribe to:
- RSVP changes
- Time vote changes

Avoid over-subscribing (performance risk).

### 9. Shared Hooks with Callbacks — Always Use `useRef`

When a shared hook in `/common` accepts a callback and manages a long-lived subscription (Realtime, event listener, interval), use `useRef` to hold the latest callback so the dep array can intentionally exclude it without going stale:

```typescript
// ✅ Correct — always calls the latest version
const callbackRef = useRef(callback);
useEffect(() => { callbackRef.current = callback; });
// call callbackRef.current() inside the subscription handler

// ❌ Wrong — stale closure if callback closes over state
useEffect(() => {
  subscribe(() => callback());
}, [id]); // callback not in deps — silently stale
```

**Why:** Excluding callbacks from the dep array prevents resubscribing on every render, but the closure goes stale. `useRef` bridges this safely.

### 10. Never Match Edge Function Errors by HTTP Status Code

Match on the error message content, not the HTTP status code.

```typescript
// ✅ Correct — specific to the known case
if (error?.message?.includes('not a member')) { /* swallow */ }

// ❌ Wrong — catches ALL 404s including unrelated errors
if ((error as any)?.status === 404) { /* silently swallows "Group not found" too */ }
```

**Why:** Our Edge Functions use the same status code (e.g. 404) for multiple distinct cases. Status-based matching silently swallows unrelated errors.

### 11. Never Fetch User Profiles via `auth.admin.getUserById` in Loops

```typescript
// ✅ Correct — single JOIN query
supabase.from('groups').select('*, group_users(user_id, profile:profiles(name, avatar_url))')

// ❌ Wrong — N+1 HTTP calls to the auth service
await Promise.all(userIds.map(id => supabase.auth.admin.getUserById(id)))
```

**Why:** Each `getUserById` is a separate HTTP call. 10 groups × 5 members = 50 calls per page load. All user profile data lives in the `profiles` table (synced from `auth.users` via trigger) and is joinable directly.

### 12. Shared Hook Event Interfaces — Use Discriminated Unions

When a shared hook emits events, use a discriminated union instead of individual callbacks:

```typescript
// ✅ Correct — adding 'updated' later is non-breaking
type MyEvent = { type: 'added'; id: string } | { type: 'removed'; id: string }
useMyHook(supabase, id, (event) => { if (event.type === 'removed') ... })

// ❌ Wrong — adding onUpdated is a breaking change for all callers
useMyHook(supabase, id, onAdded, onRemoved)
```

**Why:** Discriminated unions extend without breaking existing consumers and force exhaustive handling at call sites.

### 13. Never Duplicate Type Definitions — Re-export from `@down/common`

Platform packages (`/down`, `/web`) must never redefine types that already exist in `@down/common`. Define once in common, re-export everywhere else.

```typescript
// ✅ Correct — in down/src/types/index.ts
export type { EventSuggestion, DownGroup, RSVP, RSVPStatus, User } from '@down/common';

// ❌ Wrong — redefines the type locally, drifts silently when common changes
export interface EventSuggestion { id: string; title: string; ... }
```

**Why:** Local redefinitions fall out of sync when the common type gains new fields. TypeScript won't catch the drift if the shapes are structurally compatible — the mismatch only surfaces at runtime.

### 14. Never Fetch a Single Event by Searching All Groups

Use `fetchEventById(supabase, eventId)` from `@down/common` when you need one event. Never loop over all groups and call `fetchEvents()` per group to find a single item.

```typescript
// ✅ Correct — single Edge Function call
const event = await fetchEventById(supabase, eventId);

// ❌ Wrong — N+1: fetches every group's events to find one
const groups = await fetchGroups(supabase);
for (const group of groups) {
  const events = await fetchEvents(supabase, group.id);
  const found = events.find((e) => e.id === id);
  if (found) { ... }
}
```

**Why:** The loop fires one network request per group the user belongs to. 10 groups = 10 requests per page load, scaling linearly as users join more groups.

### 15. Optimistic Updates Must Roll Back on Failure

When applying an optimistic UI update before an async operation resolves, always capture the previous state and restore it if the operation fails.

```typescript
// ✅ Correct — captures and restores on error
const prev = selected;
setSelected(status);
await submitRSVP(supabase, eventId, status).catch(() => setSelected(prev));

// ❌ Wrong — shows wrong state if the request fails
setSelected(status);
await submitRSVP(supabase, eventId, status).catch(console.error);
```

**Why:** Silent failures leave the UI in an incorrect state the user can't recover from without a page reload.

### 16. Use Zustand Stores for Persistent UI State, Not `useState` in Layouts

State that must survive client-side navigation (unread counts, fetched lists displayed in the layout shell) belongs in a Zustand store, not component `useState`.

```typescript
// ✅ Correct — survives navigation, initialized once
const { notifications, addNotification } = useNotificationStore();

// ❌ Wrong — resets every time the layout remounts on navigation
const [notifications, setNotifications] = useState<Notification[]>([]);
```

Web Zustand stores live in `/web/lib/stores/`. Mirror the pattern from the RN stores in `/down/src/stores/`.

### 17. Use `sonner` for Error/Success Feedback on Web — No `alert()`

All user-facing error and success messages on web use `sonner` toasts. Never use `window.alert()` or `window.confirm()` for feedback (they block the main thread and look broken).

```typescript
// ✅ Correct
import { toast } from 'sonner';
toast.error(e?.message ?? 'Something went wrong');

// ❌ Wrong — blocks main thread, jarring UX
alert(e?.message ?? 'Something went wrong');
```

`<Toaster richColors position="bottom-center" />` is mounted in `web/app/layout.tsx`. For destructive confirmations, build an inline confirmation UI or a shadcn `AlertDialog` — never `window.confirm()`.

### 18. Profiles Are the Source of Truth for User Data ⚠️ CRITICAL

- Names, avatars, and other display fields come from the `profiles` row (joined in queries, mapped to domain `User`). Never treat `auth.users` / `user_metadata` as authoritative for those fields in app code.

### 19. Permissions Are Defined in Common and Mirrored to Edge Functions ⚠️ CRITICAL

- Canonical file: `/common/src/utils/permissions.ts`. Edge Functions must import `../_shared/permissions.ts`, which stays a byte-for-byte mirror of that file (header: `AUTO-GENERATED` — do not hand-edit).
- After changing permissions in common, update `_shared/permissions.ts` the same way. Never duplicate role maps or permission lists inside a single function or platform package.

### 20. Always Gate Capabilities with `hasPermission()`

- Use `hasPermission(role, permission)` from `@down/common` (clients) or `_shared/permissions.ts` (Edge Functions). Do not infer capabilities from raw role string comparisons (`role === 'admin'`, `['owner','admin'].includes(role)`, etc.) except where the product explicitly means “this exact role,” not “has this permission.”

### 21. Enumerated Business Values Use Shared `const` Arrays ⚠️ CRITICAL

- Statuses, roles, RSVP values, event phases, and similar fixed vocab live in `@down/common` as `as const` arrays (or single maps keyed by those values), with TypeScript types derived from them (`typeof ARR[number]`). No one-off magic strings for the same concept across files.

---

## UX & Tone Guidelines

The app should feel **meme-y, playful, and social** — like texting friends, never corporate.

Examples of correct tone:
- "You pulling up?"
- "Say less"
- "Who's actually down tho 👀"
- "What's the move?"
- "Addy?"

### Design Principles
- **Low friction** — minimal taps, minimal typing, smart defaults
- **Clarity first** — instantly see who's going and which time works best
- **Informal** — copy and UI should feel like a group chat, not a calendar app

---

## Supabase Setup

```
EXPO_PUBLIC_SUPABASE_URL=https://odtjglrjxgkphieqqrhb.supabase.co/
EXPO_PUBLIC_SUPABASE_ANON_KEY=<in .env — never commit>
```

Auth: Google OAuth (live), Apple OAuth (planned)

---

## Non-Goals (For Now)
- Complex calendar integrations
- Enterprise scheduling features
- Overly detailed permissions systems
- Chat within events/groups (future)

---

## Instructions for Claude

### You MUST:
- Challenge unnecessary complexity
- Suggest scalable patterns
- Keep solutions clean and modular
- Align with shared code strategy (React Native + Next.js)
- Preserve the informal, meme-y tone in any UI copy

### Before writing any new code, ask:
1. **Is this logic shared?** → Put it in `/common`, not in a platform folder
2. **Is this a backend concern?** → It goes in a Supabase Edge Function, not Next.js
3. **Am I exposing a Supabase type to the UI?** → Map it to a domain type first
4. **Am I duplicating something that already exists in `/common`?** → Don't — import it
5. **Does this type already exist in `@down/common`?** → Re-export it, never redefine it
6. **Am I applying an optimistic update?** → Capture prev state and roll back on error
7. **Is this UI state needed across navigation?** → Put it in a Zustand store, not `useState`
8. **User display data?** → From `profiles` / domain `User`, not `user_metadata`
9. **Checking what a role can do?** → `hasPermission()`; if I changed permissions, did I mirror `_shared/permissions.ts`?
10. **A fixed set of string values (status, phase, etc.)?** → Add or reuse a `const` array in `@down/common`, derive the type from it

### When generating code:
- Use clear folder structures matching the project layout above
- Separate logic from UI
- Prefer reusable components driven by props
- Keep components small and focused
- Use NativeWind (Tailwind classes) for styling on RN — avoid raw `StyleSheet` unless necessary
- Use Tailwind classes for styling on web — no inline styles

### Web UI components — shadcn only ⚠️ CRITICAL

**All basic UI primitives on web must use shadcn components from `/web/components/ui/`. Never build custom replacements.**

This includes: buttons, inputs, text fields, sliders, checkboxes, selects, dialogs, badges, cards, and any other primitive that shadcn covers.

- ✅ `import { Button } from '@/components/ui/button'`
- ✅ `import { Input } from '@/components/ui/input'`
- ✅ `import { Slider } from '@/components/ui/slider'`
- ❌ Never write a custom `<input>` or `<button>` element in place of a shadcn component
- ❌ Never create a new `/web/components/ui/` file for something shadcn already provides

If a needed shadcn component doesn't exist yet in `/web/components/ui/`, add it via the shadcn CLI or scaffold it following the existing pattern — don't hand-roll a substitute.

### Hardcoded rules — never violate these:
- ❌ Never create Next.js API routes or Server Actions
- ❌ Never use `@supabase/ssr`, server cookies, or server-side Supabase clients in Next.js
- ❌ Never pass raw Supabase types (`user_metadata`, response shapes) into UI components
- ❌ Never duplicate auth state logic — use the shared `useAuthState` hook from `@down/common`
- ❌ Never write platform-specific code that could be shared
- ❌ Never use raw HTML inputs/buttons on web — always use shadcn components
- ❌ Never redefine types in `/down` or `/web` that already exist in `@down/common` — re-export instead
- ❌ Never loop over all groups + `fetchEvents()` to find a single event — use `fetchEventById()`
- ❌ Never use `window.alert()` or `window.confirm()` on web — use `sonner` toasts and shadcn `AlertDialog`
- ❌ Never leave optimistic UI updates without a rollback on async failure
- ❌ Never use `user_metadata` (or auth user fields) as the source of truth for profile display data — use `profiles` / domain `User`
- ❌ Never edit `backend/supabase/functions/_shared/permissions.ts` by hand or duplicate permission logic outside `/common/src/utils/permissions.ts` + its mirror
- ❌ Never gate features with ad-hoc role string checks when a `Permission` exists — use `hasPermission()`
- ❌ Never introduce parallel magic strings for the same enumerated product value — define once in `@down/common` as `const` + derived type

### When suggesting architecture:
- Think long-term scalability
- Avoid duplication between platforms
- Keep Supabase queries efficient and domain-scoped

### When unsure:
Ask clarifying questions before making assumptions. Do not invent requirements.
