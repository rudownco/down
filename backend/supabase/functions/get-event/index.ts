import { getUser, createServiceClient, err, ok, corsHeaders } from "../_shared/auth.ts"

// POST /functions/v1/get-event
// Body: { event_id }
// Returns a single event with time options, votes, and RSVPs.
// Requires the caller to be a member of the group the event belongs to.

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return err("Method not allowed", 405)

  try {
    const user = await getUser(req)
    console.log("[get-event] user:", user.id)
    const supabase = createServiceClient()

    const { event_id } = await req.json()
    if (!event_id?.trim()) return err("event_id is required", 400)

    console.log("[get-event] fetching event:", event_id)

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select(`
        id, title, description, location, category, dress_code, dress_code_note, status, voting_ends_at, confirmed_time_option_id, created_at, group_id,
        suggestedBy:profiles!events_created_by_fkey(id, name, avatar_url),
        votingOptions:event_time_options!event_time_options_event_id_fkey(
          id, date, time,
          votes:event_time_votes(count),
          voters:event_time_votes(user_id, profile:profiles!event_time_votes_user_id_fkey(id, name, avatar_url))
        ),
        rsvps(id, user_id, status, updated_at, profile:profiles!rsvps_user_id_fkey(id, name, avatar_url))
      `)
      .eq("id", event_id)
      .single()

    if (eventError || !event) {
      console.error("[get-event] event not found:", eventError)
      return err("Event not found", 404)
    }

    console.log("[get-event] checking membership for group:", event.group_id)

    // Verify caller is a member of the event's group
    const { data: membership, error: memberError } = await supabase
      .from("group_users")
      .select("role")
      .eq("group_id", event.group_id)
      .eq("user_id", user.id)
      .single()

    if (memberError || !membership) {
      console.error("[get-event] membership check error:", memberError)
      return err("Not a member of this group", 403)
    }

    return ok(mapEvent(event))
  } catch (e) {
    console.error("[get-event] error:", e)
    const message = e instanceof Error ? e.message : String(e)
    return err(message, message === "Unauthorized" ? 401 : 500)
  }
})

function mapEvent(e: any) {
  const rsvps = (e.rsvps ?? []).map((r: any) => ({
    id: r.id,
    userId: r.user_id,
    eventId: e.id,
    status: r.status,
    updatedAt: r.updated_at,
  }))

  const attendees = (e.rsvps ?? [])
    .filter((r: any) => r.profile)
    .map((r: any) => ({
      id: r.profile.id,
      name: r.profile.name,
      avatarUrl: r.profile.avatar_url ?? undefined,
    }))

  return {
    id: e.id,
    title: e.title,
    description: e.description ?? undefined,
    location: e.location ?? undefined,
    category: e.category ?? undefined,
    dressCode: e.dress_code ?? undefined,
    dressCodeNote: e.dress_code_note ?? undefined,
    status: e.status,
    votingEndsAt: e.voting_ends_at ?? undefined,
    confirmedTimeOptionId: e.confirmed_time_option_id ?? undefined,
    suggestedBy: {
      id: e.suggestedBy.id,
      name: e.suggestedBy.name,
      avatarUrl: e.suggestedBy.avatar_url ?? undefined,
    },
    attendees,
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
    rsvps,
  }
}
