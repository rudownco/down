import { getUser, createServiceClient, err, ok, corsHeaders } from "../_shared/auth.ts"

// GET /functions/v1/get-user-groups
// Returns all groups the authenticated user is a member of, with member profiles.

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const user = await getUser(req)
    console.log("[get-user-groups] user:", user.id)
    const supabase = createServiceClient()

    const { data: memberships, error: memErr } = await supabase
      .from("group_users")
      .select("group_id")
      .eq("user_id", user.id)

    if (memErr) throw memErr

    const groupIds = memberships.map((m: { group_id: string }) => m.group_id)
    if (groupIds.length === 0) return ok([])

    const { data: groups, error } = await supabase
      .from("groups")
      .select(`
        id, name, created_by, last_activity, created_at,
        group_users ( user_id )
      `)
      .in("id", groupIds)
      .order("last_activity", { ascending: false })

    if (error) throw error

    // Collect unique user IDs across all groups and fetch profiles
    const allUserIds = [...new Set(
      groups.flatMap((g: any) => g.group_users.map((gu: any) => gu.user_id))
    )]

    const profileMap: Record<string, { id: string; name: string; avatar_url: string | null }> = {}
    await Promise.all(
      allUserIds.map(async (uid: string) => {
        const { data: { user: u } } = await supabase.auth.admin.getUserById(uid)
        if (u) {
          profileMap[u.id] = {
            id: u.id,
            name: u.user_metadata?.full_name || u.email || "Unknown",
            avatar_url: u.user_metadata?.avatar_url || null,
          }
        }
      })
    )

    console.log("[get-user-groups] found", groups.length, "groups,", allUserIds.length, "members")

    const payload = groups.map((group: any) => ({
      id:            group.id,
      name:          group.name,
      created_by:    group.created_by,
      last_activity: group.last_activity,
      created_at:    group.created_at,
      member_ids:    group.group_users.map((gu: any) => gu.user_id),
      member_count:  group.group_users.length,
      members:       group.group_users.map((gu: any) => profileMap[gu.user_id]).filter(Boolean),
    }))

    return ok(payload)
  } catch (e) {
    console.error("[get-user-groups] error:", e)
    const message = e instanceof Error ? e.message : "Unknown error"
    const status = message === "Unauthorized" ? 401 : 500
    return err(message, status)
  }
})
