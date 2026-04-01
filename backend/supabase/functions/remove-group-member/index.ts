import { getUser, createServiceClient, err, ok, corsHeaders } from "../_shared/auth.ts"

// POST /functions/v1/remove-group-member
// Body: { group_id: string, user_id: string }
// Removes a member from a group. Only the group creator can remove others.
// A member can also remove themselves (leave group), except the creator.

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

    // Fetch the group to check permissions
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("id, created_by")
      .eq("id", group_id)
      .single()

    if (groupError || !group) {
      console.error("[remove-group-member] group fetch error:", groupError)
      return err("Group not found", 404)
    }

    const isCreator = caller.id === group.created_by
    const isSelf = caller.id === user_id

    // Permissions:
    // - Creator can remove any member (except themselves — they own the group)
    // - A member can remove themselves (leave)
    // - Nobody else can remove others
    if (!isCreator && !isSelf) {
      console.log("[remove-group-member] forbidden — caller is not creator or self")
      return err("Only the group creator can remove other members", 403)
    }

    if (isCreator && isSelf) {
      return err("The group creator cannot leave. Transfer ownership or delete the group instead.", 403)
    }

    // Verify the target user is actually a member
    const { data: membership, error: memError } = await supabase
      .from("group_users")
      .select("user_id")
      .eq("group_id", group_id)
      .eq("user_id", user_id)
      .single()

    if (memError || !membership) {
      console.log("[remove-group-member] user is not a member:", user_id)
      return err("User is not a member of this group", 404)
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
