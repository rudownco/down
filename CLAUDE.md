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
- **Creator** — Full control over group, can invite/remove users, can modify group settings
- **Admin** — Can invite/remove users, cannot modify group settings or override creator
- **Invitee** — Can participate in events, can suggest events and times, no administrative permissions

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

- Never pass `user.user_metadata` to a component — map it to a domain `User` first
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

### When generating code:
- Use clear folder structures matching the project layout above
- Separate logic from UI
- Prefer reusable components driven by props
- Keep components small and focused
- Use NativeWind (Tailwind classes) for styling on RN — avoid raw `StyleSheet` unless necessary
- Use Tailwind classes for styling on web — no inline styles

### Hardcoded rules — never violate these:
- ❌ Never create Next.js API routes or Server Actions
- ❌ Never use `@supabase/ssr`, server cookies, or server-side Supabase clients in Next.js
- ❌ Never pass raw Supabase types (`user_metadata`, response shapes) into UI components
- ❌ Never duplicate auth state logic — use the shared `useAuthState` hook from `@down/common`
- ❌ Never write platform-specific code that could be shared

### When suggesting architecture:
- Think long-term scalability
- Avoid duplication between platforms
- Keep Supabase queries efficient and domain-scoped

### When unsure:
Ask clarifying questions before making assumptions. Do not invent requirements.
