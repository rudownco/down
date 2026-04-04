import { getUser, createServiceClient, err, ok, corsHeaders } from "../_shared/auth.ts"

// POST /functions/v1/submit-rsvp
// Body: { event_id, status: 'going' | 'maybe' | 'not_going' }
// Upserts the calling user's RSVP for an event. Requires event.rsvp permission (initiate+).

const VALID_STATUSES = ["going", "maybe", "not_going"]

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return err("Method not allowed", 405)

  try {
    const user = await getUser(req)
    console.log("[submit-rsvp] user:", user.id)
    const supabase = createServiceClient()

    const { event_id, status } = await req.json()
    if (!event_id?.trim()) return err("event_id is required", 400)
    if (!status || !VALID_STATUSES.includes(status)) {
      return err(`status must be one of: ${VALID_STATUSES.join(", ")}`, 400)
    }

    // Fetch the event to get group_id
    console.log("[submit-rsvp] fetching event:", event_id)
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, group_id")
      .eq("id", event_id)
      .single()

    if (eventError || !event) {
      console.error("[submit-rsvp] event not found:", eventError)
      return err("Event not found", 404)
    }

    // Check caller has event.rsvp permission (initiate+, i.e., any group member)
    console.log("[submit-rsvp] checking membership for group:", event.group_id)
    const { data: membership, error: memberError } = await supabase
      .from("group_users")
      .select("role")
      .eq("group_id", event.group_id)
      .eq("user_id", user.id)
      .single()

    if (memberError || !membership) {
      console.error("[submit-rsvp] membership check error:", memberError)
      return err("Not a member of this group", 403)
    }

    // Upsert RSVP (insert or update on conflict)
    console.log("[submit-rsvp] upserting RSVP:", status, "for event:", event_id)
    const { data: rsvp, error: upsertError } = await supabase
      .from("rsvps")
      .upsert(
        { event_id, user_id: user.id, status, updated_at: new Date().toISOString() },
        { onConflict: "event_id,user_id" }
      )
      .select()
      .single()

    if (upsertError) {
      console.error("[submit-rsvp] upsert error:", JSON.stringify(upsertError))
      throw new Error(upsertError.message)
    }

    console.log("[submit-rsvp] done, rsvp:", rsvp.id)

    return ok({
      id: rsvp.id,
      userId: rsvp.user_id,
      eventId: rsvp.event_id,
      status: rsvp.status,
      updatedAt: rsvp.updated_at,
    })
  } catch (e) {
    console.error("[submit-rsvp] error:", e)
    const message = e instanceof Error ? e.message : String(e)
    return err(message, message === "Unauthorized" ? 401 : 500)
  }
})
