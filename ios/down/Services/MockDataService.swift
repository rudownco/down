import Foundation

// MARK: - Service Protocol
protocol DownServiceProtocol {
    func fetchGroups(for userId: String) async throws -> [DownGroup]
    func fetchEvents(for groupId: String) async throws -> [EventSuggestion]
    func submitVotes(eventId: String, optionIds: [String], userId: String) async throws -> EventSuggestion
    func submitRSVP(eventId: String, status: RSVPStatus, userId: String) async throws -> RSVP
    func createEvent(_ event: EventSuggestion, in groupId: String) async throws -> EventSuggestion
    func createGroup(name: String) async throws -> DownGroup
    func signIn(provider: AuthProvider) async throws -> User
}

enum AuthProvider {
    case apple, google
}

enum ServiceError: LocalizedError {
    case notFound
    case unauthorized
    case networkError(String)

    var errorDescription: String? {
        switch self {
        case .notFound:              return "The requested item was not found."
        case .unauthorized:          return "You are not authorized to perform this action."
        case .networkError(let msg): return msg
        }
    }
}

// MARK: - Mock Implementation
// A single shared instance is used so all ViewModels see the same in-memory
// state — newly created events appear when navigating back, voted options
// show updated counts, and RSVPs persist within the session.
final class MockDownService: DownServiceProtocol, @unchecked Sendable {

    /// Shared instance — all ViewModels default to this.
    static let shared = MockDownService()

    // MARK: In-memory session state
    // groupId → events created at runtime
    private var createdEvents:  [String: [EventSuggestion]] = [:]
    // eventId → event mutated by votes or RSVPs this session
    private var mutatedEvents:  [String: EventSuggestion]   = [:]

    // MARK: Helpers

    private func delay(_ seconds: Double = 0.6) async {
        try? await Task.sleep(nanoseconds: UInt64(seconds * 1_000_000_000))
    }

    private var allSeedEvents: [EventSuggestion] {
        [MockEvents.pizzaNight, MockEvents.movieMarathon,
         MockEvents.coffeeRun,  MockEvents.gamingSession]
    }

    // MARK: - DownServiceProtocol

    func fetchGroups(for userId: String) async throws -> [DownGroup] {
        return []
    }

    func fetchEvents(for groupId: String) async throws -> [EventSuggestion] {
        await delay(0.4)
        let base  = MockGroups.all.first { $0.id == groupId }?.mockEvents ?? []
        // Apply any in-session mutations (votes, RSVPs)
        let merged = base.map { mutatedEvents[$0.id] ?? $0 }
        // Prepend events created during this session
        let extra  = createdEvents[groupId] ?? []
        return extra + merged
    }

    func submitVotes(eventId: String, optionIds: [String], userId: String) async throws -> EventSuggestion {
        await delay()
        var event = mutatedEvents[eventId]
            ?? allSeedEvents.first { $0.id == eventId }
            ?? MockEvents.pizzaNight
        for i in event.votingOptions.indices {
            if optionIds.contains(event.votingOptions[i].id) {
                event.votingOptions[i].votes += 1
                if !event.votingOptions[i].voters.contains(where: { $0.id == userId }),
                   let user = MockUsers.all.first(where: { $0.id == userId }) {
                    event.votingOptions[i].voters.append(user)
                }
            }
        }
        mutatedEvents[eventId] = event
        return event
    }

    func submitRSVP(eventId: String, status: RSVPStatus, userId: String) async throws -> RSVP {
        await delay()
        let rsvp = RSVP(userId: userId, eventId: eventId, status: status)
        var event = mutatedEvents[eventId]
            ?? allSeedEvents.first { $0.id == eventId }
            ?? MockEvents.movieMarathon
        if let idx = event.rsvps.firstIndex(where: { $0.userId == userId }) {
            event.rsvps[idx] = rsvp
        } else {
            event.rsvps.append(rsvp)
        }
        mutatedEvents[eventId] = event
        return rsvp
    }

    func createEvent(_ event: EventSuggestion, in groupId: String) async throws -> EventSuggestion {
        await delay(0.8)
        createdEvents[groupId, default: []].insert(event, at: 0)
        return event
    }

    func createGroup(name: String) async throws -> DownGroup {
        await delay(0.6)
        return DownGroup(name: name)
    }

    func signIn(provider: AuthProvider) async throws -> User {
        await delay(1.2)
        return MockUsers.currentUser
    }
}
