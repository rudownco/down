---
description: Check for schema drift between the live DB and common/src/types/index.ts
allowed-tools: Read, mcp__supabase__generate_typescript_types
---

Check for type drift between the live Supabase schema and the domain types in @down/common.

1. Run mcp__supabase__generate_typescript_types to get the current DB schema as TypeScript.
2. Read `common/src/types/index.ts`.
3. For each key table — groups, group_users, events, event_time_options, event_time_votes, rsvps, notifications, profiles, user_notification_settings — compare the DB columns against what's mapped in the domain types.
4. Report any columns that exist in the DB but have no corresponding field in the domain types or API mapping layer.
5. Do NOT auto-edit anything. Report findings only, then ask which gaps the user wants to address.

Note: Not every DB column needs a domain type. Internal columns used only in JOINs or for RLS (e.g. raw foreign keys, `updated_at` on join tables) are fine to omit. Flag columns that look like they carry product-relevant data that a client might want to read or display.
