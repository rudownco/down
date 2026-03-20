import Foundation

@MainActor
final class VotingViewModel: ObservableObject {
    @Published var event: EventSuggestion
    @Published var selectedOptionIds: Set<String> = []
    @Published var isSubmitting = false
    @Published var didSubmit = false
    @Published var error: String?

    let currentUser: User
    private let service: DownServiceProtocol

    init(event: EventSuggestion, currentUser: User, service: DownServiceProtocol = MockDownService()) {
        self.event       = event
        self.currentUser = currentUser
        self.service     = service
    }

    var canSubmit: Bool { !selectedOptionIds.isEmpty }

    var leadingOptionId: String? {
        event.votingOptions.max(by: { $0.votes < $1.votes })?.id
    }

    func toggle(optionId: String) {
        if selectedOptionIds.contains(optionId) {
            selectedOptionIds.remove(optionId)
        } else {
            selectedOptionIds.insert(optionId)
        }
    }

    func isSelected(_ optionId: String) -> Bool {
        selectedOptionIds.contains(optionId)
    }

    func isLeading(_ optionId: String) -> Bool {
        optionId == leadingOptionId && !isSelected(optionId)
    }

    func submitVotes() async -> EventSuggestion? {
        guard canSubmit else { return nil }
        isSubmitting = true
        error = nil
        defer { isSubmitting = false }
        do {
            let updated = try await service.submitVotes(
                eventId: event.id,
                optionIds: Array(selectedOptionIds),
                userId: currentUser.id
            )
            event = updated
            didSubmit = true
            return updated
        } catch {
            self.error = error.localizedDescription
            return nil
        }
    }
}
