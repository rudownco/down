import { getUser, createServiceClient, err, ok, corsHeaders } from "../_shared/auth.ts"

// POST /functions/v1/create-invite
// Body: { group_id: string }
// Creates a shareable invite token for a group.

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return err("Method not allowed", 405)

  try {
    const user = await getUser(req)
    const supabase = createServiceClient()

    const { group_id } = await req.json()
    if (!group_id) return err("group_id is required", 400)

    // Verify the user is a member of this group
    const { data: membership } = await supabase
      .from("group_users")
      .select("user_id")
      .eq("group_id", group_id)
      .eq("user_id", user.id)
      .maybeSingle()

    if (!membership) return err("Not a member of this group", 403)

    // Generate a unique token
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days

    const { error: insertErr } = await supabase
      .from("group_invite_tokens")
      .insert({
        token,
        group_id,
        expires_at: expiresAt,
      })

    if (insertErr) {
      console.error("[create-invite] insert error:", JSON.stringify(insertErr))
      throw new Error(insertErr.message)
    }

    console.log("[create-invite] token created for group:", group_id)

    return ok({ token, expires_at: expiresAt })
  } catch (e) {
    console.error("[create-invite] error:", e)
    const message = e instanceof Error ? e.message : "Unknown error"
    const status = message === "Unauthorized" ? 401 : 500
    return err(message, status)
  }
})
