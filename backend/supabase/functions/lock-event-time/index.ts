import { getUser, createServiceClient, err, ok, corsHeaders } from "../_shared/auth.ts"
import { hasPermission, type GroupRole } from "../_shared/permissions.ts"

// POST /functions/v1/lock-event-time
// Body: { event_id, time_option_id: string | null }
// Selects the winning time option and advances the event from 'voting' to 'rsvp'.
// Requires event.lock_time permission (admin+).

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return err("Method not allowed", 405)

  try {
    const user = await getUser(req)
    console.log("[lock-event-time] user:", user.id)
    const supabase = createServiceClient()

    const { event_id, time_option_id } = await req.json()
    if (!event_id?.trim()) return err("event_id is required", 400)

    // Fetch event to get group_id + status
    console.log("[lock-event-time] fetching event:", event_id)
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, group_id, status")
      .eq("id", event_id)
      .single()

    if (eventError || !event) {
      console.error("[lock-event-time] event not found:", eventError)
      return err("Event not found", 404)
    }

    if (event.status !== "voting") {
      return err("Event is not in voting phase", 400)
    }

    // Check caller is admin+
    console.log("[lock-event-time] checking membership for group:", event.group_id)
    const { data: membership, error: memberError } = await supabase
      .from("group_users")
      .select("role")
      .eq("group_id", event.group_id)
      .eq("user_id", user.id)
      .single()

    if (memberError || !membership) {
      console.error("[lock-event-time] membership check error:", memberError)
      return err("Not a member of this group", 403)
    }

    if (!hasPermission(membership.role as GroupRole, "event.lock_time")) {
      return err("Only admins and owners can lock the event time", 403)
    }

    // If a time_option_id was provided, verify it belongs to this event
    if (time_option_id) {
      console.log("[lock-event-time] verifying time option belongs to event")
      const { data: option, error: optError } = await supabase
        .from("event_time_options")
        .select("id")
        .eq("id", time_option_id)
        .eq("event_id", event_id)
        .single()

      if (optError || !option) {
        console.error("[lock-event-time] time option not found:", optError)
        return err("Time option not found for this event", 404)
      }
    }

    // Transition event to confirmed
    console.log("[lock-event-time] confirming event, confirmed option:", time_option_id ?? "none")
    const { error: updateError } = await supabase
      .from("events")
      .update({
        status: "confirmed",
        confirmed_time_option_id: time_option_id ?? null,
      })
      .eq("id", event_id)

    if (updateError) {
      console.error("[lock-event-time] update error:", JSON.stringify(updateError))
      throw new Error(updateError.message)
    }

    console.log("[lock-event-time] fetching updated event")
    const full = await fetchFullEvent(supabase, event_id)
    console.log("[lock-event-time] done")
    return ok(full)
  } catch (e) {
    console.error("[lock-event-time] error:", e)
    const message = e instanceof Error ? e.message : String(e)
    return err(message, message === "Unauthorized" ? 401 : 500)
  }
})

async function fetchFullEvent(supabase: ReturnType<typeof createServiceClient>, eventId: string) {
  const { data: event, error } = await supabase
    .from("events")
    .select(`
      id, title, description, location, status, voting_ends_at, confirmed_time_option_id, created_at,
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
    votingEndsAt: event.voting_ends_at ?? undefined,
    confirmedTimeOptionId: event.confirmed_time_option_id ?? undefined,
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
