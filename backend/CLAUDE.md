# Down Backend — Supabase Edge Functions

## Edge Function Registration

Every new edge function **must** be registered in `supabase/config.toml` with `verify_jwt = false`:

```toml
[functions.my-new-function]
verify_jwt = false
```

We handle JWT verification ourselves in application code via `getUser(req)` in `_shared/auth.ts`. The Supabase gateway-level JWT check must be disabled — otherwise requests are rejected before reaching our function.

## Auth Pattern

- `getUser(req)` — verifies the user's JWT using the anon-key authed client (not service role). Returns the user or throws `"Unauthorized"`.
- `createAuthedClient(req)` — creates a Supabase client scoped to the user's JWT so RLS policies apply.
- Never use the service role key unless absolutely necessary. RLS should be enforced.

## Logging

Every edge function **must** include console.log/console.error at key points — Supabase provides no logs otherwise. Follow this pattern:

```ts
const user = await getUser(req)
console.log("[function-name] user:", user.id)

// Log before/after each DB operation
console.log("[function-name] doing X...")
const { data, error } = await supabase.from("table")...
if (error) {
  console.error("[function-name] X error:", error)
  throw error
}
console.log("[function-name] X done:", data.length, "rows")

// Always log caught errors
} catch (e) {
  console.error("[function-name] error:", e)
}
```

## Deploying

```bash
supabase functions deploy <function-name>
```
