import { getUser, createServiceClient, err, ok, corsHeaders } from "../_shared/auth.ts"
import { hasPermission, canManageRole, getAssignableRoles } from "../_shared/permissions.ts"
import type { GroupRole } from "../_shared/permissions.ts"

// POST /functions/v1/update-member-role
// Body: { group_id: string, user_id: string, new_role: GroupRole }
// Changes a member's role. Caller must have 'member.promote' permission
// and outrank both the target's current role and the new role.
// Cannot set role to 'owner' — use transfer-ownership instead.

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return err("Method not allowed", 405)

  try {
    const caller = await getUser(req)
    console.log("[update-member-role] caller:", caller.id)

    const { group_id, user_id, new_role } = await req.json()
    if (!group_id) return err("group_id is required", 400)
    if (!user_id) return err("user_id is required", 400)
    if (!new_role) return err("new_role is required", 400)

    if (new_role === "owner") {
      return err("Cannot promote to owner. Use transfer-ownership instead.", 400)
    }

    const validRoles = ["admin", "member", "initiate"]
    if (!validRoles.includes(new_role)) {
      return err("Invalid role: " + new_role, 400)
    }

    if (caller.id === user_id) {
      return err("You cannot change your own role", 400)
    }

    const supabase = createServiceClient()

    // Fetch caller's role
    const { data: callerRow, error: callerErr } = await supabase
      .from("group_users")
      .select("role")
      .eq("group_id", group_id)
      .eq("user_id", caller.id)
      .single()

    if (callerErr || !callerRow) {
      return err("You are not a member of this group", 403)
    }

    const callerRole = callerRow.role as GroupRole

    // Fetch target's current role
    const { data: targetRow, error: targetErr } = await supabase
      .from("group_users")
      .select("role")
      .eq("group_id", group_id)
      .eq("user_id", user_id)
      .single()

    if (targetErr || !targetRow) {
      return err("User is not a member of this group", 404)
    }

    const targetRole = targetRow.role as GroupRole

    // Validate the role change is allowed
    const assignable = getAssignableRoles(callerRole, targetRole)
    if (!assignable.includes(new_role as GroupRole)) {
      console.log("[update-member-role] forbidden:", callerRole, "->", new_role, "for target:", targetRole)
      return err("You don't have permission to assign this role", 403)
    }

    // Apply the role change
    const { error: updateErr } = await supabase
      .from("group_users")
      .update({ role: new_role })
      .eq("group_id", group_id)
      .eq("user_id", user_id)

    if (updateErr) {
      console.error("[update-member-role] update error:", JSON.stringify(updateErr))
      throw new Error(updateErr.message)
    }

    console.log("[update-member-role] updated", user_id, "from", targetRole, "to", new_role)
    return ok({ success: true, previous_role: targetRole, new_role })

  } catch (e) {
    console.error("[update-member-role] error:", e)
    const message = e instanceof Error ? e.message : "Unknown error"
    const status = message === "Unauthorized" ? 401 : 500
    return err(message, status)
  }
})
