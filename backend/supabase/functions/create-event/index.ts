import { getUser, createServiceClient, err, ok, corsHeaders } from "../_shared/auth.ts"

// POST /functions/v1/create-event
// Body: { group_id, title, description?, location?, time_options?: [{date, time}] }
// Creates a new event for the group. Requires event.create permission (admin+).

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return err("Method not allowed", 405)

  try {
    const user = await getUser(req)
    console.log("[create-event] user:", user.id)
    const supabase = createServiceClient()

    const { group_id, title, description, location, time_options } = await req.json()

    if (!group_id?.trim()) return err("group_id is required", 400)
    if (!title?.trim()) return err("title is required", 400)

    // Verify caller is a member with event.create permission (admin+)
    console.log("[create-event] checking permission for user:", user.id, "in group:", group_id)
    const { data: membership, error: memberError } = await supabase
      .from("group_users")
      .select("role")
      .eq("group_id", group_id)
      .eq("user_id", user.id)
      .single()

    if (memberError || !membership) {
      console.error("[create-event] membership check error:", memberError)
      return err("Not a member of this group", 403)
    }

    if (!["owner", "admin"].includes(membership.role)) {
      return err("Only admins and owners can create events", 403)
    }

    console.log("[create-event] creating event:", title.trim())

    // Create the event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        group_id,
        title: title.trim(),
        description: description ?? null,
        location: location ?? null,
        status: "voting",
        created_by: user.id,
      })
      .select()
      .single()

    if (eventError) {
      console.error("[create-event] insert event error:", JSON.stringify(eventError))
      throw new Error(eventError.message)
    }

    console.log("[create-event] event created:", event.id)

    // Insert initial time options if provided
    if (Array.isArray(time_options) && time_options.length > 0) {
      const rows = time_options.map((opt: { date: string; time: string }) => ({
        event_id: event.id,
        date: opt.date,
        time: opt.time,
        suggested_by: user.id,
      }))

      const { error: optError } = await supabase.from("event_time_options").insert(rows)
      if (optError) {
        console.error("[create-event] insert time options error:", JSON.stringify(optError))
        throw new Error(optError.message)
      }
      console.log("[create-event] inserted", rows.length, "time options")
    }

    // Fetch full event to return
    const full = await fetchFullEvent(supabase, event.id)
    console.log("[create-event] done")
    return ok(full)
  } catch (e) {
    console.error("[create-event] error:", e)
    const message = e instanceof Error ? e.message : String(e)
    return err(message, message === "Unauthorized" ? 401 : 500)
  }
})

async function fetchFullEvent(supabase: ReturnType<typeof createServiceClient>, eventId: string) {
  const { data: event, error } = await supabase
    .from("events")
    .select(`
      id, title, description, location, status, created_at,
      suggestedBy:profiles!events_created_by_fkey(id, name, avatar_url),
      votingOptions:event_time_options(
        id, date, time,
        votes:event_time_votes(count),
        voters:event_time_votes(user_id, profile:profiles!event_time_votes_user_id_fkey(id, name, avatar_url))
      ),
      rsvps(id, user_id, status, updated_at)
    `)
    .eq("id", eventId)
    .single()

  if (error) throw new Error(error.message)

  return mapEvent(event)
}

function mapEvent(e: any) {
  return {
    id: e.id,
    title: e.title,
    description: e.description ?? undefined,
    location: e.location ?? undefined,
    status: e.status,
    suggestedBy: {
      id: e.suggestedBy.id,
      name: e.suggestedBy.name,
      avatarUrl: e.suggestedBy.avatar_url ?? undefined,
    },
    attendees: [],
    votingOptions: (e.votingOptions ?? []).map((opt: any) => ({
      id: opt.id,
      date: opt.date,
      time: opt.time,
      votes: opt.votes?.[0]?.count ?? 0,
      voters: (opt.voters ?? []).map((v: any) => ({
        id: v.profile.id,
        name: v.profile.name,
        avatarUrl: v.profile.avatar_url ?? undefined,
      })),
    })),
    rsvps: (e.rsvps ?? []).map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      eventId: e.id,
      status: r.status,
      updatedAt: r.updated_at,
    })),
  }
}
