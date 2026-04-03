import { getUser, createServiceClient, err, ok, corsHeaders } from "../_shared/auth.ts"
import { hasPermission, canManageRole } from "../_shared/permissions.ts"
import type { GroupRole } from "../_shared/permissions.ts"

// POST /functions/v1/remove-group-member
// Body: { group_id: string, user_id: string }
// Removes a member from a group. Requires 'member.remove' permission and
// the caller must outrank the target. A member can also remove themselves
// (leave group), except the owner.

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return err("Method not allowed", 405)

  try {
    const caller = await getUser(req)
    console.log("[remove-group-member] caller:", caller.id)

    const { group_id, user_id } = await req.json()
    if (!group_id) return err("group_id is required", 400)
    if (!user_id) return err("user_id is required", 400)

    const supabase = createServiceClient()
    const isSelf = caller.id === user_id

    // Fetch caller's membership and role
    const { data: callerMembership, error: callerErr } = await supabase
      .from("group_users")
      .select("role")
      .eq("group_id", group_id)
      .eq("user_id", caller.id)
      .single()

    if (callerErr || !callerMembership) {
      console.error("[remove-group-member] caller not a member:", callerErr)
      return err("You are not a member of this group", 403)
    }

    const callerRole = callerMembership.role as GroupRole

    // Self-removal (leaving the group)
    if (isSelf) {
      if (callerRole === "owner") {
        return err("The group owner cannot leave. Transfer ownership or delete the group instead.", 403)
      }
      // Any non-owner can leave
    } else {
      // Removing another member — check permissions
      if (!hasPermission(callerRole, "member.remove")) {
        console.log("[remove-group-member] forbidden — caller role:", callerRole)
        return err("You don't have permission to remove members", 403)
      }

      // Fetch target's role to ensure caller outranks them
      const { data: targetMembership, error: targetErr } = await supabase
        .from("group_users")
        .select("role")
        .eq("group_id", group_id)
        .eq("user_id", user_id)
        .single()

      if (targetErr || !targetMembership) {
        console.log("[remove-group-member] user is not a member:", user_id)
        return err("User is not a member of this group", 404)
      }

      const targetRole = targetMembership.role as GroupRole
      if (!canManageRole(callerRole, targetRole)) {
        console.log("[remove-group-member] cannot remove equal/higher rank:", callerRole, "vs", targetRole)
        return err("You cannot remove a member of equal or higher rank", 403)
      }
    }

    // Remove the member
    const { error: deleteError } = await supabase
      .from("group_users")
      .delete()
      .eq("group_id", group_id)
      .eq("user_id", user_id)

    if (deleteError) {
      console.error("[remove-group-member] delete error:", JSON.stringify(deleteError))
      throw new Error(deleteError.message)
    }

    console.log("[remove-group-member] removed user", user_id, "from group", group_id)
    return ok({ success: true })

  } catch (e) {
    console.error("[remove-group-member] error:", e)
    const message = e instanceof Error ? e.message : "Unknown error"
    const status = message === "Unauthorized" ? 401 : 500
    return err(message, status)
  }
})
