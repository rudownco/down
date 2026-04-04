---
description: Apply a SQL migration to the Supabase database
argument-hint: [description]
allowed-tools: mcp__supabase__apply_migration, mcp__supabase__execute_sql
---

Apply a SQL database migration.

If "$ARGUMENTS" is empty, ask the user for:
1. A short description of what the migration does (will become the migration name)
2. The SQL to apply

If "$ARGUMENTS" is provided, use it as the description and ask only for the SQL.

Then:
1. Derive a snake_case migration name from the description.
   Examples: "add notifications table" → "add_notifications_table"
            "add actor_name to notifications" → "add_actor_name_to_notifications"
            "create group roles" → "create_group_roles"

2. Apply via mcp__supabase__apply_migration with that name and the provided SQL.

3. Run a quick verification with mcp__supabase__execute_sql to confirm the change took effect
   (e.g. check the table exists, or the column appears in information_schema.columns).

4. Report the migration name and a one-line summary of what was created or altered.
