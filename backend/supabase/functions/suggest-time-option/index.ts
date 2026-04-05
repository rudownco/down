import { getUser, createServiceClient, err, ok, corsHeaders } from "../_shared/auth.ts"
import { hasPermission, type GroupRole } from "../_shared/permissions.ts"

// POST /functions/v1/suggest-time-option
// Body: { event_id, date, time }
// Adds a new time option to an event. Requires event.suggest_time permission (member+).

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return err("Method not allowed", 405)

  try {
    const user = await getUser(req)
    console.log("[suggest-time-option] user:", user.id)
    const supabase = createServiceClient()

    const { event_id, date, time } = await req.json()
    if (!event_id?.trim()) return err("event_id is required", 400)
    if (!date?.trim()) return err("date is required", 400)
    if (!time?.trim()) return err("time is required", 400)

    // Fetch the event to get its group_id
    console.log("[suggest-time-option] fetching event:", event_id)
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, group_id, status, voting_ends_at")
      .eq("id", event_id)
      .single()

    if (eventError || !event) {
      console.error("[suggest-time-option] event not found:", eventError)
      return err("Event not found", 404)
    }

    if (event.status !== "voting") {
      return err("Can only suggest times for events in voting status", 400)
    }

    // Check caller has event.suggest_time permission (member+)
    console.log("[suggest-time-option] checking membership for group:", event.group_id)
    const { data: membership, error: memberError } = await supabase
      .from("group_users")
      .select("role")
      .eq("group_id", event.group_id)
      .eq("user_id", user.id)
      .single()

    if (memberError || !membership) {
      console.error("[suggest-time-option] membership check error:", memberError)
      return err("Not a member of this group", 403)
    }

    if (!hasPermission(membership.role as GroupRole, "event.suggest_time")) {
      return err("Only members and above can suggest time options", 403)
    }

    console.log("[suggest-time-option] inserting time option for event:", event_id)
    const { error: insertError } = await supabase.from("event_time_options").insert({
      event_id,
      date: date.trim(),
      time: time.trim(),
      suggested_by: user.id,
    })

    if (insertError) {
      console.error("[suggest-time-option] insert error:", JSON.stringify(insertError))
      throw new Error(insertError.message)
    }

    console.log("[suggest-time-option] fetching updated event")
    const full = await fetchFullEvent(supabase, event_id)
    console.log("[suggest-time-option] done")
    return ok(full)
  } catch (e) {
    console.error("[suggest-time-option] error:", e)
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
      votingOptions:event_time_options!event_time_options_event_id_fkey(
        id, date, time,
        votes:event_time_votes(count),
        voters:event_time_votes(user_id, profile:profiles!event_time_votes_user_id_fkey(id, name, avatar_url))
      ),
      rsvps(id, user_id, status, updated_at)
    `)
    .eq("id", eventId)
    .single()

  if (error) throw new Error(error.message)

  return {
    id: event.id,
    title: event.title,
    description: event.description ?? undefined,
    location: event.location ?? undefined,
    status: event.status,
    suggestedBy: {
      id: event.suggestedBy.id,
      name: event.suggestedBy.name,
      avatarUrl: event.suggestedBy.avatar_url ?? undefined,
    },
    attendees: [],
    votingOptions: (event.votingOptions ?? []).map((opt: any) => ({
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
    rsvps: (event.rsvps ?? []).map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      eventId: event.id,
      status: r.status,
      updatedAt: r.updated_at,
    })),
  }
}
