import { describe, expect, it } from "vitest"
import {
  mapEdgeEventToDto,
  pickWinningTimeOptionId,
  resolveInitialEventStatus,
} from "./event-dto.ts"

// ─── resolveInitialEventStatus ─────────────────────────────────────────────

describe("resolveInitialEventStatus", () => {
  it("returns voting only when time options AND deadline", () => {
    expect(resolveInitialEventStatus(true, true)).toBe("voting")
    expect(resolveInitialEventStatus(false, true)).toBe("confirmed")
    expect(resolveInitialEventStatus(true, false)).toBe("confirmed")
    expect(resolveInitialEventStatus(false, false)).toBe("confirmed")
  })
})

// ─── pickWinningTimeOptionId ───────────────────────────────────────────────

describe("pickWinningTimeOptionId", () => {
  it("returns null for empty or undefined input", () => {
    expect(pickWinningTimeOptionId([])).toBeNull()
    expect(pickWinningTimeOptionId(undefined as unknown as [])).toBeNull()
  })

  it("returns the only option id", () => {
    expect(
      pickWinningTimeOptionId([{ id: "opt-1", votes: [{ count: 0 }] }]),
    ).toBe("opt-1")
  })

  it("picks highest vote count", () => {
    const id = pickWinningTimeOptionId([
      { id: "a", votes: [{ count: 2 }] },
      { id: "b", votes: [{ count: 5 }] },
      { id: "c", votes: [{ count: 3 }] },
    ])
    expect(id).toBe("b")
  })

  it("on tie, first listed option among max wins (stable sort)", () => {
    const id = pickWinningTimeOptionId([
      { id: "first", votes: [{ count: 3 }] },
      { id: "second", votes: [{ count: 3 }] },
    ])
    expect(id).toBe("first")
  })

  it("treats missing votes as 0", () => {
    const id = pickWinningTimeOptionId([
      { id: "no-votes" },
      { id: "has-votes", votes: [{ count: 1 }] },
    ])
    expect(id).toBe("has-votes")
  })
})

// ─── mapEdgeEventToDto ─────────────────────────────────────────────────────

function baseSuggestedBy() {
  return { id: "u1", name: "Alex", avatar_url: null }
}

function minimalEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: "evt-1",
    title: "Smoking some crazy Zaza",
    description: "Bring snacks",
    location: "Ujwal's House",
    category: "hangout",
    dress_code: "casual",
    dress_code_note: "No heels",
    status: "confirmed",
    voting_ends_at: null,
    confirmed_time_option_id: "opt-1",
    suggestedBy: baseSuggestedBy(),
    votingOptions: [],
    rsvps: [],
    ...overrides,
  }
}

describe("mapEdgeEventToDto", () => {
  it("maps core fields and dress code", () => {
    const dto = mapEdgeEventToDto(minimalEvent())
    expect(dto.id).toBe("evt-1")
    expect(dto.title).toBe("Smoking some crazy Zaza")
    expect(dto.description).toBe("Bring snacks")
    expect(dto.location).toBe("Ujwal's House")
    expect(dto.category).toBe("hangout")
    expect(dto.dressCode).toBe("casual")
    expect(dto.dressCodeNote).toBe("No heels")
    expect(dto.status).toBe("confirmed")
    expect(dto.confirmedTimeOptionId).toBe("opt-1")
    expect(dto.suggestedBy.id).toBe("u1")
    expect(dto.suggestedBy.name).toBe("Alex")
    expect(dto.suggestedBy.avatarUrl).toBeUndefined()
    expect(dto.votingOptions).toHaveLength(0)
    expect(dto.rsvps).toHaveLength(0)
    expect(dto.attendees).toHaveLength(0)
  })

  it("maps nullables to undefined", () => {
    const dto = mapEdgeEventToDto(
      minimalEvent({
        description: null,
        location: null,
        category: null,
        dress_code: null,
        dress_code_note: null,
        voting_ends_at: null,
        confirmed_time_option_id: null,
      }),
    )
    expect(dto.description).toBeUndefined()
    expect(dto.location).toBeUndefined()
    expect(dto.category).toBeUndefined()
    expect(dto.dressCode).toBeUndefined()
    expect(dto.dressCodeNote).toBeUndefined()
    expect(dto.votingEndsAt).toBeUndefined()
    expect(dto.confirmedTimeOptionId).toBeUndefined()
  })

  it("maps RSVPs and attendees from profiles", () => {
    const dto = mapEdgeEventToDto(
      minimalEvent({
        rsvps: [
          {
            id: "r1",
            user_id: "u2",
            status: "going",
            updated_at: "2026-01-01T00:00:00Z",
            profile: { id: "u2", name: "Sam", avatar_url: "https://x/y.png" },
          },
          {
            id: "r2",
            user_id: "u3",
            status: "maybe",
            updated_at: "2026-01-02T00:00:00Z",
            profile: null,
          },
        ],
      }),
    )
    expect(dto.rsvps).toHaveLength(2)
    expect(dto.rsvps[0].userId).toBe("u2")
    expect(dto.rsvps[0].status).toBe("going")
    expect(dto.rsvps[0].eventId).toBe("evt-1")
    expect(dto.attendees).toHaveLength(1)
    expect(dto.attendees[0].name).toBe("Sam")
    expect(dto.attendees[0].avatarUrl).toBe("https://x/y.png")
  })

  it("maps voting options, vote counts, and voters", () => {
    const dto = mapEdgeEventToDto(
      minimalEvent({
        votingOptions: [
          {
            id: "opt-a",
            date: "2026-04-10",
            time: "19:00",
            votes: [{ count: 2 }],
            voters: [
              {
                user_id: "u2",
                profile: { id: "u2", name: "Sam", avatar_url: null },
              },
            ],
          },
          {
            id: "opt-b",
            date: "2026-04-11",
            time: "20:00",
            votes: [{ count: 0 }],
            voters: [],
          },
        ],
      }),
    )
    expect(dto.votingOptions).toHaveLength(2)
    expect(dto.votingOptions[0].votes).toBe(2)
    expect(dto.votingOptions[0].voters).toHaveLength(1)
    expect(dto.votingOptions[0].voters[0].name).toBe("Sam")
    expect(dto.votingOptions[1].votes).toBe(0)
  })

  it("throws if suggestedBy is null", () => {
    expect(() => mapEdgeEventToDto(minimalEvent({ suggestedBy: null }))).toThrow(
      TypeError,
    )
  })
})
