import { getUser, createServiceClient, err, ok, corsHeaders } from "../_shared/auth.ts"

// POST /functions/v1/accept-invite
// Body: { token: string }
// Validates an invite token, adds the user to the group, marks the token used.

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return err("Method not allowed", 405)

  try {
    const user = await getUser(req)
    const supabase = createServiceClient()

    const { token } = await req.json()
    if (!token || typeof token !== "string") return err("Missing token", 400)

    // Look up the invite
    const { data: invite, error: inviteErr } = await supabase
      .from("group_invite_tokens")
      .select("token, group_id, expires_at, used_at, used_by")
      .eq("token", token)
      .maybeSingle()

    if (inviteErr || !invite) return err("Invite not found", 404)

    // Expiry check
    if (invite.expires_at && Date.now() > new Date(invite.expires_at).getTime()) {
      return err("Invite expired", 400)
    }

    // Already used by a different user
    if (invite.used_at && invite.used_by !== user.id) {
      return err("Invite already used by another user", 403)
    }

    // Upsert membership
    const { error: memberErr } = await supabase.from("group_users").upsert(
      {
        group_id: invite.group_id,
        user_id: user.id,
        role: "initiate",
        joined_at: new Date().toISOString(),
      },
      { onConflict: "group_id,user_id" }
    )
    if (memberErr) {
      console.error("[accept-invite] upsert error:", JSON.stringify(memberErr))
      throw new Error(memberErr.message)
    }

    // Mark token used (only if not already)
    if (!invite.used_at) {
      await supabase
        .from("group_invite_tokens")
        .update({ used_at: new Date().toISOString(), used_by: user.id })
        .eq("token", token)
    }

    // Fetch group name for the success screen
    const { data: group } = await supabase
      .from("groups")
      .select("name")
      .eq("id", invite.group_id)
      .single()

    console.log("[accept-invite] user", user.id, "joined group", invite.group_id)

    return ok({
      ok: true,
      group_id: invite.group_id,
      group_name: group?.name ?? "your squad",
    })
  } catch (e) {
    console.error("[accept-invite] error:", e)
    const message = e instanceof Error ? e.message : "Unknown error"
    const status = message === "Unauthorized" ? 401 : 500
    return err(message, status)
  }
})
