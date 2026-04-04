import { getUser, createServiceClient, err, ok, corsHeaders } from "../_shared/auth.ts"

// POST /functions/v1/submit-votes
// Body: { event_id, option_ids: string[] }
// Records the calling user's votes on event time options. Requires event.vote permission (initiate+).
// Replaces any previous votes this user cast on this event.

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return err("Method not allowed", 405)

  try {
    const user = await getUser(req)
    console.log("[submit-votes] user:", user.id)
    const supabase = createServiceClient()

    const { event_id, option_ids } = await req.json()
    if (!event_id?.trim()) return err("event_id is required", 400)
    if (!Array.isArray(option_ids) || option_ids.length === 0) return err("option_ids must be a non-empty array", 400)

    // Fetch the event to get group_id + status
    console.log("[submit-votes] fetching event:", event_id)
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, group_id, status")
      .eq("id", event_id)
      .single()

    if (eventError || !event) {
      console.error("[submit-votes] event not found:", eventError)
      return err("Event not found", 404)
    }

    if (event.status !== "voting") {
      return err("Voting is closed for this event", 400)
    }

    // Check caller has event.vote permission (initiate+, i.e., any group member)
    console.log("[submit-votes] checking membership for group:", event.group_id)
    const { data: membership, error: memberError } = await supabase
      .from("group_users")
      .select("role")
      .eq("group_id", event.group_id)
      .eq("user_id", user.id)
      .single()

    if (memberError || !membership) {
      console.error("[submit-votes] membership check error:", memberError)
      return err("Not a member of this group", 403)
    }

    // Verify all option_ids belong to this event
    console.log("[submit-votes] verifying options belong to event")
    const { data: validOptions, error: optError } = await supabase
      .from("event_time_options")
      .select("id")
      .eq("event_id", event_id)
      .in("id", option_ids)

    if (optError) {
      console.error("[submit-votes] option verification error:", optError)
      throw new Error(optError.message)
    }

    if (!validOptions || validOptions.length !== option_ids.length) {
      return err("One or more option_ids do not belong to this event", 400)
    }

    // Delete the user's existing votes for this event's options
    console.log("[submit-votes] clearing old votes for user:", user.id)
    const { data: allOptions } = await supabase
      .from("event_time_options")
      .select("id")
      .eq("event_id", event_id)

    const allOptionIds = (allOptions ?? []).map((o: any) => o.id)

    if (allOptionIds.length > 0) {
      const { error: deleteError } = await supabase
        .from("event_time_votes")
        .delete()
        .eq("user_id", user.id)
        .in("event_time_option_id", allOptionIds)

      if (deleteError) {
        console.error("[submit-votes] delete old votes error:", deleteError)
        throw new Error(deleteError.message)
      }
    }

    // Insert new votes
    console.log("[submit-votes] inserting", option_ids.length, "votes")
    const { error: insertError } = await supabase.from("event_time_votes").insert(
      option_ids.map((optId: string) => ({
        event_time_option_id: optId,
        user_id: user.id,
      }))
    )

    if (insertError) {
      console.error("[submit-votes] insert error:", JSON.stringify(insertError))
      throw new Error(insertError.message)
    }

    console.log("[submit-votes] fetching updated event")
    const full = await fetchFullEvent(supabase, event_id)
    console.log("[submit-votes] done")
    return ok(full)
  } catch (e) {
    console.error("[submit-votes] error:", e)
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
