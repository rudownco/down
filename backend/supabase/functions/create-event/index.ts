import { getUser, createServiceClient, err, ok, corsHeaders } from "../_shared/auth.ts"
import { mapEdgeEventToDto, resolveInitialEventStatus } from "../_shared/event-dto.ts"
import { hasPermission, type GroupRole } from "../_shared/permissions.ts"

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

    const { group_id, title, description, location, category, dress_code, dress_code_note, time_options, voting_ends_at } = await req.json()

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

    if (!hasPermission(membership.role as GroupRole, "event.create")) {
      return err("Only admins and owners can create events", 403)
    }

    console.log("[create-event] creating event:", title.trim())

    // Events only enter voting mode when there are time options AND a voting deadline.
    // Without a deadline there's nothing to vote on — confirm immediately.
    const hasTimeOptions = Array.isArray(time_options) && time_options.length > 0
    const hasDeadline = !!voting_ends_at
    const initialStatus = resolveInitialEventStatus(hasTimeOptions, hasDeadline)
    console.log("[create-event] initial status:", initialStatus)

    // Create the event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        group_id,
        title: title.trim(),
        description: description ?? null,
        location: location ?? null,
        category: category ?? null,
        dress_code: dress_code ?? null,
        dress_code_note: dress_code_note ?? null,
        status: initialStatus,
        created_by: user.id,
        voting_ends_at: hasDeadline ? voting_ends_at : null,
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

      const { data: insertedOptions, error: optError } = await supabase
        .from("event_time_options")
        .insert(rows)
        .select("id")
      if (optError) {
        console.error("[create-event] insert time options error:", JSON.stringify(optError))
        throw new Error(optError.message)
      }
      console.log("[create-event] inserted", rows.length, "time options")

      // If confirmed immediately, lock the first time option as the confirmed time
      if (initialStatus === "confirmed" && insertedOptions?.[0]?.id) {
        console.log("[create-event] setting confirmed_time_option_id:", insertedOptions[0].id)
        const { error: confirmErr } = await supabase
          .from("events")
          .update({ confirmed_time_option_id: insertedOptions[0].id })
          .eq("id", event.id)
        if (confirmErr) {
          console.error("[create-event] set confirmed_time_option_id error:", JSON.stringify(confirmErr))
          throw new Error(confirmErr.message)
        }
      }
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
      id, title, description, location, category, dress_code, dress_code_note, status, voting_ends_at, confirmed_time_option_id, created_at,
      suggestedBy:profiles!events_created_by_fkey(id, name, avatar_url),
      votingOptions:event_time_options!event_time_options_event_id_fkey(
        id, date, time,
        votes:event_time_votes(count),
        voters:event_time_votes(user_id, profile:profiles!event_time_votes_user_id_fkey(id, name, avatar_url))
      ),
      rsvps(id, user_id, status, updated_at, profile:profiles!rsvps_user_id_fkey(id, name, avatar_url))
    `)
    .eq("id", eventId)
    .single()

  if (error) throw new Error(error.message)

  return mapEdgeEventToDto(event)
}
