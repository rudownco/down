import Foundation
import Supabase

// MARK: - Supabase Service
// Handles real auth. Data methods delegate to MockDownService until
// Supabase tables are set up.

@MainActor
final class SupabaseService: DownServiceProtocol {

    private let mock = MockDownService()

    nonisolated init() {}

    // MARK: - Auth

    func signIn(provider: AuthProvider) async throws -> User {
        switch provider {
        case .apple:  return try await signInWithApple()
        case .google: return try await signInWithGoogle()
        }
    }

    private func signInWithApple() async throws -> User {
        let coordinator = AppleSignInCoordinator()
        let (idToken, nonce) = try await coordinator.signIn()
        let session = try await supabase.auth.signInWithIdToken(
            credentials: OpenIDConnectCredentials(provider: .apple, idToken: idToken, nonce: nonce)
        )
        supabase.functions.setAuth(token: session.accessToken)
        return mapUser(from: session)
    }

    private func signInWithGoogle() async throws -> User {
        // The Supabase SDK handles ASWebAuthenticationSession internally.
        let session = try await supabase.auth.signInWithOAuth(
            provider: Provider.google,
            redirectTo: URL(string: "down://auth")
        )
        supabase.functions.setAuth(token: session.accessToken)
        return mapUser(from: session)
    }

    func restoreSession() async -> User? {
        guard let session = try? await supabase.auth.session else { return nil }
        supabase.functions.setAuth(token: session.accessToken)
        return mapUser(from: session)
    }

    private func mapUser(from session: Session) -> User {
        let meta = session.user.userMetadata
        let name: String = {
            if case .string(let v) = meta["full_name"] { return v }
            if case .string(let v) = meta["name"]      { return v }
            return session.user.email ?? "User"
        }()
        return User(id: session.user.id.uuidString, name: name)
    }

    func fetchGroups(for userId: String) async throws -> [DownGroup] {
        let session = try await supabase.auth.session
        let response: [GroupResponse] = try await supabase.functions
            .invoke("get-user-groups", options: .init(
                method: .get,
                headers: ["Authorization": "Bearer \(session.accessToken)"]
            ))
        return response.map {
            DownGroup(
                id: $0.id,
                name: $0.name,
                memberCount: $0.memberCount,
                lastActivity: $0.lastActivity.relativeFormatted()
            )
        }
    }

    func fetchEvents(for groupId: String) async throws -> [EventSuggestion] {
        try await mock.fetchEvents(for: groupId)
    }

    func submitVotes(eventId: String, optionIds: [String], userId: String) async throws -> EventSuggestion {
        try await mock.submitVotes(eventId: eventId, optionIds: optionIds, userId: userId)
    }

    func submitRSVP(eventId: String, status: RSVPStatus, userId: String) async throws -> RSVP {
        try await mock.submitRSVP(eventId: eventId, status: status, userId: userId)
    }

    func createEvent(_ event: EventSuggestion, in groupId: String) async throws -> EventSuggestion {
        try await mock.createEvent(event, in: groupId)
    }

    func createGroup(name: String) async throws -> DownGroup {
        do {
            let session = try await supabase.auth.session
            let response: GroupResponse = try await supabase.functions
                .invoke("create-group", options: .init(
                    method: .post,
                    headers: ["Authorization": "Bearer \(session.accessToken)"],
                    body: CreateGroupRequest(name: name)
                ))
            print("[create-group] ✅ created '\(response.name)' id=\(response.id)")
            return DownGroup(
                id: response.id,
                name: response.name,
                memberCount: response.memberCount,
                lastActivity: response.lastActivity.relativeFormatted()
            )
        } catch {
            print("[create-group] ❌ \(error)")
            throw error
        }
    }
}

// MARK: - Request models

private struct CreateGroupRequest: Encodable, Sendable {
    let name: String
}

// MARK: - Response models

private struct GroupResponse: Decodable {
    let id: String
    let name: String
    let lastActivity: String
    let memberCount: Int
    let memberIds: [String]

    enum CodingKeys: String, CodingKey {
        case id, name
        case lastActivity  = "last_activity"
        case memberCount   = "member_count"
        case memberIds     = "member_ids"
    }
}
