import { getUser, createServiceClient, err, ok, corsHeaders } from "../_shared/auth.ts"
import type { GroupRole } from "../_shared/permissions.ts"

// POST /functions/v1/transfer-ownership
// Body: { group_id: string, new_owner_id: string }
// Transfers group ownership. Caller must be the current owner.
// The caller is demoted to admin.

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return err("Method not allowed", 405)

  try {
    const caller = await getUser(req)
    console.log("[transfer-ownership] caller:", caller.id)

    const { group_id, new_owner_id } = await req.json()
    if (!group_id) return err("group_id is required", 400)
    if (!new_owner_id) return err("new_owner_id is required", 400)

    if (caller.id === new_owner_id) {
      return err("You are already the owner", 400)
    }

    const supabase = createServiceClient()

    // Verify caller is the owner
    const { data: callerRow, error: callerErr } = await supabase
      .from("group_users")
      .select("role")
      .eq("group_id", group_id)
      .eq("user_id", caller.id)
      .single()

    if (callerErr || !callerRow) {
      return err("You are not a member of this group", 403)
    }

    if ((callerRow.role as GroupRole) !== "owner") {
      return err("Only the group owner can transfer ownership", 403)
    }

    // Verify target is a member
    const { data: targetRow, error: targetErr } = await supabase
      .from("group_users")
      .select("role")
      .eq("group_id", group_id)
      .eq("user_id", new_owner_id)
      .single()

    if (targetErr || !targetRow) {
      return err("User is not a member of this group", 404)
    }

    // Promote target to owner
    const { error: promoteErr } = await supabase
      .from("group_users")
      .update({ role: "owner" })
      .eq("group_id", group_id)
      .eq("user_id", new_owner_id)

    if (promoteErr) {
      console.error("[transfer-ownership] promote error:", JSON.stringify(promoteErr))
      throw new Error(promoteErr.message)
    }

    // Demote caller to admin
    const { error: demoteErr } = await supabase
      .from("group_users")
      .update({ role: "admin" })
      .eq("group_id", group_id)
      .eq("user_id", caller.id)

    if (demoteErr) {
      console.error("[transfer-ownership] demote error:", JSON.stringify(demoteErr))
      throw new Error(demoteErr.message)
    }

    console.log("[transfer-ownership] transferred ownership from", caller.id, "to", new_owner_id)
    return ok({ success: true })

  } catch (e) {
    console.error("[transfer-ownership] error:", e)
    const message = e instanceof Error ? e.message : "Unknown error"
    const status = message === "Unauthorized" ? 401 : 500
    return err(message, status)
  }
})
