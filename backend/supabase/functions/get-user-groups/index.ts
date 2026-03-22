import { getUser, createAuthedClient, err, ok } from "../_shared/auth.ts"

// GET /functions/v1/get-groups
// Returns all groups the authenticated user is a member of,

Deno.serve(async (req: Request) => {
  try {
    const user = await getUser(req)
    const supabase = createAuthedClient(req)

    const { data: groups, error } = await supabase
      .from("groups")
      .select(
        `
        id,
        name,
        created_by,
        last_activity,
        created_at,
        group_users ( user_id )
      `
      )
      .order("last_activity", { ascending: false })

    if (error) throw error

    const payload = groups.map((group) => ({
      id:            group.id,
      name:          group.name,
      created_by:    group.created_by,
      last_activity: group.last_activity,
      created_at:    group.created_at,
      member_ids:    group.group_users.map((gu: { user_id: string }) => gu.user_id),
      member_count:  group.group_users.length,
    }))

    return ok(payload)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    const status = message === "Unauthorized" ? 401 : 500
    return err(message, status)
  }
})
