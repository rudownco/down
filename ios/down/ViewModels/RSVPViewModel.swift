import Foundation
import Combine

@MainActor
final class RSVPViewModel: ObservableObject {
    @Published var event: EventSuggestion
    @Published var selectedStatus: RSVPStatus?
    @Published var isSubmitting = false
    @Published var didSubmit = false
    @Published var error: String?

    let currentUser: User
    let groupMembers: [User]
    private let service: DownServiceProtocol

    init(event: EventSuggestion, currentUser: User, groupMembers: [User], service: DownServiceProtocol = MockDownService()) {
        self.event        = event
        self.currentUser  = currentUser
        self.groupMembers = groupMembers
        self.service      = service

        // Pre-select the user's existing RSVP if present
        self.selectedStatus = event.rsvps.first(where: { $0.userId == currentUser.id })?.status
    }

    var canSubmit: Bool { selectedStatus != nil }

    func select(status: RSVPStatus) {
        selectedStatus = (selectedStatus == status) ? nil : status
    }

    func usersForStatus(_ status: RSVPStatus) -> [User] {
        event.rsvpUsers(for: status, in: groupMembers)
    }

    func confirmRSVP() async -> Bool {
        guard let status = selectedStatus else { return false }
        isSubmitting = true
        error = nil
        defer { isSubmitting = false }
        do {
            let rsvp = try await service.submitRSVP(
                eventId: event.id,
                status: status,
                userId: currentUser.id
            )
            // Update local event rsvps
            if let idx = event.rsvps.firstIndex(where: { $0.userId == currentUser.id }) {
                event.rsvps[idx] = rsvp
            } else {
                event.rsvps.append(rsvp)
            }
            didSubmit = true
            return true
        } catch {
            self.error = error.localizedDescription
            return false
        }
    }
}
