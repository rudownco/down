import Foundation
import Combine

@MainActor
final class GroupDetailViewModel: ObservableObject {
    @Published var events: [EventSuggestion] = []
    @Published var isLoading = false
    @Published var error: String?

    let group: DownGroup
    let currentUser: User
    private let service: DownServiceProtocol

    init(group: DownGroup, currentUser: User, service: DownServiceProtocol = MockDownService()) {
        self.group       = group
        self.currentUser = currentUser
        self.service     = service
    }

    func loadEvents() async {
        isLoading = true
        error = nil
        defer { isLoading = false }
        do {
            events = try await service.fetchEvents(for: group.id)
        } catch {
            self.error = error.localizedDescription
        }
    }

    func addEvent(_ event: EventSuggestion) {
        events.insert(event, at: 0)
    }

    func updateEvent(_ event: EventSuggestion) {
        if let idx = events.firstIndex(where: { $0.id == event.id }) {
            events[idx] = event
        }
    }
}
