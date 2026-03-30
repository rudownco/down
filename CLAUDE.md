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

We plan to support **mobile (React Native)** and **web (Next.js)**.

**Goal:** Avoid duplicating logic across platforms.

**Approach:** Maintain a `/shared` directory for:
- Types
- API logic
- Business logic
- Validation schemas

When suggesting architecture, prefer patterns that support code sharing between React Native and Next.js. Avoid platform-locked solutions when possible.

---

## Project Structure

```
/down
  /down          ← React Native (Expo) app
    /app         ← Expo Router screens
    /components  ← Reusable UI components (NativeWind)
    /lib         ← Utilities, animations
    /src
      /context   ← Auth, global state
      /stores    ← Zustand stores
      /mocks     ← Dev mock data
  /shared        ← (planned) Shared types + logic
  /ios           ← Legacy Swift app (archived)
  CLAUDE.md
```

---

## Architecture Principles

### 1. Separation of Concerns
Keep these clearly separated:
- **UI** — presentation only, no business logic
- **Business logic** — hooks, stores, utilities
- **Data fetching** — Supabase calls isolated in service files

### 2. Core Domains
Structure code around these domains:
- `users`
- `groups`
- `events`
- `time_options`
- `rsvps`

### 3. Database Design
Likely entities:
- `users`
- `groups`
- `group_members`
- `events`
- `event_time_options`
- `event_time_votes`
- `rsvps`

Optimize queries for:
- Fetching events by group
- Fetching RSVPs by event
- Fetching time votes per event

### 4. API Design
- Small, composable endpoints
- Avoid "do everything" endpoints
- Prefer explicit over implicit

### 5. Real-Time Strategy
Subscribe to:
- RSVP changes
- Time vote changes

Avoid over-subscribing (performance risk).

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

### When generating code:
- Use clear folder structures matching the project layout above
- Separate logic from UI
- Prefer reusable components driven by props
- Keep components small and focused
- Use NativeWind (Tailwind classes) for styling — avoid raw `StyleSheet` unless necessary

### When suggesting architecture:
- Think long-term scalability
- Avoid duplication between platforms
- Keep Supabase queries efficient and domain-scoped

### When unsure:
Ask clarifying questions before making assumptions. Do not invent requirements.
