import { getUser, createAuthedClient, err, ok } from "../_shared/auth.ts"

// POST /functions/v1/create-group
// Body: { name: string }
// Creates a new group and assigns the authenticated user as the first member.

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return err("Method not allowed", 405)

  try {
    console.log("[create-group] auth header:", req.headers.get("Authorization")?.slice(0, 30) ?? "MISSING")
    const user = await getUser(req)
    console.log("[create-group] user verified:", user.id)
    const supabase = createAuthedClient(req)

    const { name } = await req.json()
    if (!name?.trim()) return err("Group name is required", 400)

    // Create the group
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({ name: name.trim(), created_by: user.id })
      .select()
      .single()

    if (groupError) throw groupError

    // Add the creator as the first member
    const { error: memberError } = await supabase
      .from("group_users")
      .insert({ group_id: group.id, user_id: user.id })

    if (memberError) throw memberError

    return ok({
      id:           group.id,
      name:         group.name,
      created_by:   group.created_by,
      last_activity: group.last_activity,
      created_at:   group.created_at,
      member_ids:   [user.id],
      member_count: 1,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    const status = message === "Unauthorized" ? 401 : 500
    return err(message, status)
  }
})
