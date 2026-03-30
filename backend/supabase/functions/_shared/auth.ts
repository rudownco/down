import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Creates a Supabase client scoped to the requesting user's JWT.
// RLS policies will automatically apply for all queries made with this client.
export function createAuthedClient(req: Request) {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: {
        headers: {
          Authorization: req.headers.get("Authorization")!,
        },
      },
    }
  )
}

// Extracts and verifies the authenticated user from the request JWT.
// Throws a 401-friendly error if the token is missing or invalid.
export async function getUser(req: Request) {
  const supabase = createAuthedClient(req)
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) throw new Error("Unauthorized")

  return user
}

// Standard JSON response helpers
export const ok = (data: unknown) =>
  new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })

export const err = (message: string, status = 400) =>
  new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  })
