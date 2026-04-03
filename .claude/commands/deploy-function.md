---
description: Deploy a Supabase edge function to production
argument-hint: <function-name>
allowed-tools: Read, mcp__supabase__deploy_edge_function
---

Deploy the Supabase edge function named "$ARGUMENTS".

1. Read `backend/supabase/functions/$ARGUMENTS/index.ts`
2. Read `backend/supabase/functions/_shared/auth.ts`
3. Call mcp__supabase__deploy_edge_function with:
   - name: "$ARGUMENTS"
   - entrypoint_path: "index.ts"
   - verify_jwt: false
   - files: [{ name: "index.ts", content: <index.ts content> }, { name: "_shared/auth.ts", content: <auth.ts content> }]
4. Report the deployed version number.
