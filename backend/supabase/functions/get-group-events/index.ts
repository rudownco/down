import { getUser, createServiceClient, err, ok, corsHeaders } from "../_shared/auth.ts"
import { mapEdgeEventToDto, pickWinningTimeOptionId } from "../_shared/event-dto.ts"

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
        id, title, description, location, category, dress_code, dress_code_note, status, voting_ends_at, confirmed_time_option_id, created_at,
        suggestedBy:profiles!events_created_by_fkey(id, name, avatar_url),
        votingOptions:event_time_options!event_time_options_event_id_fkey(
          id, date, time,
          votes:event_time_votes(count),
          voters:event_time_votes(user_id, profile:profiles!event_time_votes_user_id_fkey(id, name, avatar_url))
        ),
        rsvps(id, user_id, status, updated_at, profile:profiles!rsvps_user_id_fkey(id, name, avatar_url))
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
        const winningOptionId = pickWinningTimeOptionId(e.votingOptions ?? [])
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

    return ok((events ?? []).map(mapEdgeEventToDto))
  } catch (e) {
    console.error("[get-group-events] error:", e)
    const message = e instanceof Error ? e.message : String(e)
    return err(message, message === "Unauthorized" ? 401 : 500)
  }
})
