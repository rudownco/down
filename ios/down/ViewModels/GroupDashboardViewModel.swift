import Foundation
import Combine

@MainActor
final class GroupDashboardViewModel: ObservableObject {
    @Published var groups: [DownGroup] = []
    @Published var isLoading = false
    @Published var error: String?

    private let service: DownServiceProtocol
    let currentUser: User

    init(currentUser: User, service: DownServiceProtocol = MockDownService()) {
        self.currentUser = currentUser
        self.service     = service
    }

    func loadGroups() async {
        isLoading = true
        error = nil
        defer { isLoading = false }
        do {
            groups = try await service.fetchGroups(for: currentUser.id)
        } catch {
            self.error = error.localizedDescription
        }
    }

    func addGroup(_ group: DownGroup) {
        groups.insert(group, at: 0)
    }

    var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 0..<12: return "Good morning"
        case 12..<17: return "Good afternoon"
        default: return "Good evening"
        }
    }
}
