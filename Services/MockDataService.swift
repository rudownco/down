import Foundation

// MARK: - Service Protocol
@MainActor
protocol DownServiceProtocol {
    func fetchGroups(for userId: String) async throws -> [DownGroup]
    func fetchEvents(for groupId: String) async throws -> [EventSuggestion]
    func submitVotes(eventId: String, optionIds: [String], userId: String) async throws -> EventSuggestion
    func submitRSVP(eventId: String, status: RSVPStatus, userId: String) async throws -> RSVP
    func createEvent(_ event: EventSuggestion, in groupId: String) async throws -> EventSuggestion
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
        case .notFound:          return "The requested item was not found."
        case .unauthorized:      return "You are not authorized to perform this action."
        case .networkError(let msg): return msg
        }
    }
}

// MARK: - Mock Implementation
@MainActor
final class MockDownService: DownServiceProtocol, Sendable {

    // Simulate network latency
    private func delay(_ seconds: Double = 0.6) async {
        try? await Task.sleep(nanoseconds: UInt64(seconds * 1_000_000_000))
    }

    func fetchGroups(for userId: String) async throws -> [DownGroup] {
        await delay()
        return MockGroups.all
    }

    func fetchEvents(for groupId: String) async throws -> [EventSuggestion] {
        await delay(0.4)
        let group = MockGroups.all.first { $0.id == groupId }
        return group?.mockEvents ?? []
    }

    func submitVotes(eventId: String, optionIds: [String], userId: String) async throws -> EventSuggestion {
        await delay()
        // Return mutated event with updated vote counts
        var event = [MockEvents.pizzaNight, MockEvents.movieMarathon, MockEvents.coffeeRun, MockEvents.gamingSession]
            .first { $0.id == eventId } ?? MockEvents.pizzaNight
        for i in event.votingOptions.indices {
            if optionIds.contains(event.votingOptions[i].id) {
                event.votingOptions[i].votes += 1
            }
        }
        return event
    }

    func submitRSVP(eventId: String, status: RSVPStatus, userId: String) async throws -> RSVP {
        await delay()
        return RSVP(userId: userId, eventId: eventId, status: status)
    }

    func createEvent(_ event: EventSuggestion, in groupId: String) async throws -> EventSuggestion {
        await delay(0.8)
        return event
    }

    func signIn(provider: AuthProvider) async throws -> User {
        await delay(1.2)
        return MockUsers.currentUser
    }
}
