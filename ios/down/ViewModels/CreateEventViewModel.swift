import Foundation
import Combine
import SwiftUI

struct TimeOptionInput: Identifiable {
    let id = UUID()
    var date: Date = Date().addingTimeInterval(86400) // tomorrow
    var time: Date = {
        var c = Calendar.current.dateComponents([.year, .month, .day], from: Date())
        c.hour = 19; c.minute = 0
        return Calendar.current.date(from: c) ?? Date()
    }()

    var formattedDate: String {
        let f = DateFormatter()
        f.dateFormat = "EEEE, MMM d"
        return f.string(from: date)
    }

    var formattedTime: String {
        let f = DateFormatter()
        f.timeStyle = .short
        return f.string(from: time)
    }
}

@MainActor
final class CreateEventViewModel: ObservableObject {
    @Published var title       = ""
    @Published var description = ""
    @Published var location    = ""
    @Published var timeOptions: [TimeOptionInput] = [TimeOptionInput()]
    @Published var isSubmitting = false
    @Published var error: String?

    private let service: DownServiceProtocol
    let group: DownGroup
    let currentUser: User

    init(group: DownGroup, currentUser: User, service: DownServiceProtocol = MockDownService()) {
        self.group       = group
        self.currentUser = currentUser
        self.service     = service
    }

    var canSubmit: Bool { !title.trimmingCharacters(in: .whitespaces).isEmpty && !timeOptions.isEmpty }

    func addTimeOption() {
        timeOptions.append(TimeOptionInput())
    }

    func removeTimeOption(at offsets: IndexSet) {
        guard timeOptions.count > 1 else { return }
        timeOptions.remove(atOffsets: offsets)
    }

    func removeTimeOption(id: UUID) {
        guard timeOptions.count > 1 else { return }
        timeOptions.removeAll { $0.id == id }
    }

    func submit() async -> EventSuggestion? {
        guard canSubmit else { return nil }
        isSubmitting = true
        error = nil
        defer { isSubmitting = false }

        let options = timeOptions.map { opt in
            VotingOption(date: opt.formattedDate, time: opt.formattedTime)
        }

        let event = EventSuggestion(
            title: title.trimmingCharacters(in: .whitespaces),
            description: description.isEmpty ? nil : description,
            location: location.isEmpty ? nil : location,
            status: .voting,
            suggestedBy: currentUser,
            votingOptions: options
        )

        do {
            return try await service.createEvent(event, in: group.id)
        } catch {
            self.error = error.localizedDescription
            return nil
        }
    }
}
