import { getUser, createServiceClient, err, ok, corsHeaders } from "../_shared/auth.ts"

// POST /functions/v1/get-group-events
// Body: { group_id }
// Returns all events for a group with time options, votes, and RSVPs. Requires group membership.
// Side effect: lazily auto-transitions any 'voting' event whose voting_ends_at has passed,
// picking the time option with the most votes as the confirmed time.

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
        id, title, description, location, status, voting_ends_at, confirmed_time_option_id, created_at,
        suggestedBy:profiles!events_created_by_fkey(id, name, avatar_url),
        votingOptions:event_time_options!event_time_options_event_id_fkey(
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

    // Lazily auto-transition any voting events whose deadline has passed
    const now = new Date()
    const expired = (events ?? []).filter(
      (e: any) => e.status === "voting" && e.voting_ends_at && new Date(e.voting_ends_at) < now
    )

    if (expired.length > 0) {
      console.log("[get-group-events] auto-transitioning", expired.length, "expired voting events")
      await Promise.all(expired.map(async (e: any) => {
        const winningOptionId = pickWinner(e.votingOptions ?? [])
        console.log("[get-group-events] transitioning event", e.id, "winner:", winningOptionId ?? "none")
        const { error: updateError } = await supabase
          .from("events")
          .update({ status: "confirmed", confirmed_time_option_id: winningOptionId ?? null })
          .eq("id", e.id)
        if (updateError) {
          console.error("[get-group-events] auto-transition error for event", e.id, updateError)
        } else {
          e.status = "confirmed"
          e.confirmed_time_option_id = winningOptionId ?? null
        }
      }))
    }

    return ok((events ?? []).map(mapEvent))
  } catch (e) {
    console.error("[get-group-events] error:", e)
    const message = e instanceof Error ? e.message : String(e)
    return err(message, message === "Unauthorized" ? 401 : 500)
  }
})

/** Returns the id of the time option with the most votes, or null if there are none. */
function pickWinner(votingOptions: any[]): string | null {
  if (!votingOptions?.length) return null
  const sorted = [...votingOptions].sort((a, b) => {
    const aVotes = a.votes?.[0]?.count ?? 0
    const bVotes = b.votes?.[0]?.count ?? 0
    return bVotes - aVotes
  })
  return sorted[0]?.id ?? null
}

function mapEvent(e: any) {
  return {
    id: e.id,
    title: e.title,
    description: e.description ?? undefined,
    location: e.location ?? undefined,
    status: e.status,
    votingEndsAt: e.voting_ends_at ?? undefined,
    confirmedTimeOptionId: e.confirmed_time_option_id ?? undefined,
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
