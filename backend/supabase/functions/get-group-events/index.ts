import { getUser, createServiceClient, err, ok, corsHeaders } from "../_shared/auth.ts"

// POST /functions/v1/get-group-events
// Body: { group_id }
// Returns all events for a group with time options, votes, and RSVPs. Requires group membership.

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return err("Method not allowed", 405)

  try {
    const user = await getUser(req)
    console.log("[get-group-events] user:", user.id)
    const supabase = createServiceClient()

    const { group_id } = await req.json()
    if (!group_id?.trim()) return err("group_id is required", 400)

    // Verify caller is a member of the group
    console.log("[get-group-events] checking membership for group:", group_id)
    const { data: membership, error: memberError } = await supabase
      .from("group_users")
      .select("role")
      .eq("group_id", group_id)
      .eq("user_id", user.id)
      .single()

    if (memberError || !membership) {
      console.error("[get-group-events] membership check error:", memberError)
      return err("Not a member of this group", 403)
    }

    console.log("[get-group-events] fetching events for group:", group_id)

    const { data: events, error: eventsError } = await supabase
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
      .eq("group_id", group_id)
      .order("created_at", { ascending: false })

    if (eventsError) {
      console.error("[get-group-events] query error:", JSON.stringify(eventsError))
      throw new Error(eventsError.message)
    }

    console.log("[get-group-events] found", events?.length ?? 0, "events")

    return ok((events ?? []).map(mapEvent))
  } catch (e) {
    console.error("[get-group-events] error:", e)
    const message = e instanceof Error ? e.message : String(e)
    return err(message, message === "Unauthorized" ? 401 : 500)
  }
})

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
