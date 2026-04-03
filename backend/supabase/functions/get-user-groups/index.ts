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
        group_users ( user_id, role )
      `)
      .in("id", groupIds)
      .order("last_activity", { ascending: false })

    if (error) throw error

    // Collect unique user IDs and fetch all profiles in one query
    const allUserIds = [...new Set(
      groups.flatMap((g: any) => g.group_users.map((gu: any) => gu.user_id))
    )]

    const { data: profiles, error: profileErr } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .in("id", allUserIds)

    if (profileErr) throw profileErr

    const profileMap: Record<string, { id: string; name: string; avatar_url: string | null }> = {}
    for (const p of profiles ?? []) {
      profileMap[p.id] = p
    }

    console.log("[get-user-groups] found", groups.length, "groups,", allUserIds.length, "members")

    const payload = groups.map((group: any) => ({
      id:            group.id,
      name:          group.name,
      created_by:    group.created_by,
      last_activity: group.last_activity,
      created_at:    group.created_at,
      member_ids:    group.group_users.map((gu: any) => gu.user_id),
      member_count:  group.group_users.length,
      members:       group.group_users
        .map((gu: any) => {
          const profile = profileMap[gu.user_id]
          return profile ? { ...profile, role: gu.role ?? "member" } : null
        })
        .filter(Boolean),
    }))

    return ok(payload)
  } catch (e) {
    console.error("[get-user-groups] error:", e)
    const message = e instanceof Error ? e.message : "Unknown error"
    const status = message === "Unauthorized" ? 401 : 500
    return err(message, status)
  }
})
