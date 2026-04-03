---
description: Scaffold a new Supabase edge function with project boilerplate
argument-hint: <function-name>
allowed-tools: Read, Write, Edit
---

Scaffold a new Supabase edge function named "$ARGUMENTS".

1. Read `backend/supabase/config.toml` to confirm the existing [functions.*] registration format.

2. Create `backend/supabase/functions/$ARGUMENTS/index.ts` with this boilerplate
   (replace every occurrence of FUNCTION_NAME with "$ARGUMENTS"):

```ts
import { getUser, createServiceClient, err, ok, corsHeaders } from "../_shared/auth.ts"

// POST /functions/v1/FUNCTION_NAME
// Body: { ... }
// TODO: describe what this function does

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return err("Method not allowed", 405)

  try {
    const user = await getUser(req)
    console.log("[FUNCTION_NAME] user:", user.id)
    const supabase = createServiceClient()

    // TODO: parse and validate request body
    // const { field } = await req.json()

    return ok({ ok: true })
  } catch (e) {
    console.error("[FUNCTION_NAME] error:", e)
    const message = e instanceof Error ? e.message : "Unknown error"
    const status = message === "Unauthorized" ? 401 : 500
    return err(message, status)
  }
})
```

3. Add the following entry to `backend/supabase/config.toml` after the last `[functions.*]` block
   (currently after `[functions.remove-group-member]`):

```toml
[functions.$ARGUMENTS]
verify_jwt = false
```

4. Confirm both changes. Remind the user to:
   - Fill in the TODO sections in index.ts
   - Run `/deploy-function $ARGUMENTS` when ready to ship
