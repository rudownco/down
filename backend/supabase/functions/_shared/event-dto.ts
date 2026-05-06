/**
 * Pure helpers for event Edge Functions — map DB/join rows to the API DTO
 * and derive voting / status rules. Covered by Deno unit tests in event-dto.test.ts.
 */

/** Raw row shape from PostgREST (snake_case + nested aliases). */
// deno-lint-ignore no-explicit-any
export type EdgeEventRow = Record<string, any>

/** Returns the id of the time option with the most votes, or null if there are none. */
export function pickWinningTimeOptionId(votingOptions: EdgeEventRow[]): string | null {
  if (!votingOptions?.length) return null
  const sorted = [...votingOptions].sort((a, b) => {
    const aVotes = a.votes?.[0]?.count ?? 0
    const bVotes = b.votes?.[0]?.count ?? 0
    return bVotes - aVotes
  })
  return sorted[0]?.id ?? null
}

/**
 * Events only enter voting when there are time options AND a voting deadline.
 * Otherwise confirm immediately (CLAUDE: poll-based scheduling).
 */
export function resolveInitialEventStatus(
  hasTimeOptions: boolean,
  hasDeadline: boolean,
): "voting" | "confirmed" {
  return hasTimeOptions && hasDeadline ? "voting" : "confirmed"
}

/** Maps a joined `events` row to the JSON shape returned by create/get/list functions. */
export function mapEdgeEventToDto(e: EdgeEventRow) {
  const rsvps = (e.rsvps ?? []).map((r: EdgeEventRow) => ({
    id: r.id,
    userId: r.user_id,
    eventId: e.id,
    status: r.status,
    updatedAt: r.updated_at,
  }))

  const attendees = (e.rsvps ?? [])
    .filter((r: EdgeEventRow) => r.profile)
    .map((r: EdgeEventRow) => ({
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
    votingOptions: (e.votingOptions ?? []).map((opt: EdgeEventRow) => ({
      id: opt.id,
      date: opt.date,
      time: opt.time,
      votes: opt.votes?.[0]?.count ?? 0,
      voters: (opt.voters ?? []).map((v: EdgeEventRow) => ({
        id: v.profile.id,
        name: v.profile.name,
        avatarUrl: v.profile.avatar_url ?? undefined,
      })),
    })),
    rsvps,
  }
}
