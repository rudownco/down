import Foundation
import Combine

@MainActor
final class LoginViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var error: String?

    private let service: DownServiceProtocol

    init(service: DownServiceProtocol = MockDownService()) {
        self.service = service
    }

    func signIn(with provider: AuthProvider) async -> User? {
        isLoading = true
        error = nil
        defer { isLoading = false }
        do {
            return try await service.signIn(provider: provider)
        } catch {
            self.error = error.localizedDescription
            return nil
        }
    }
}
