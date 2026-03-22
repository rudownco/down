import AuthenticationServices
import CryptoKit
import Foundation
import UIKit

// MARK: - Apple Sign In Coordinator
//
// Bridges the ASAuthorizationController delegate pattern → async/await.
//
// Lifecycle note: ASAuthorizationController holds a *weak* reference to its
// delegate, so the coordinator must stay alive until the callback fires.
// The caller (SupabaseService) holds a strong reference via `await`, and the
// controller itself is stored as a property here to prevent early dealloc.

@MainActor
final class AppleSignInCoordinator: NSObject {

    // Retained until the auth sheet completes
    private var controller: ASAuthorizationController?
    private var continuation: CheckedContinuation<(idToken: String, nonce: String), Error>?
    private var currentNonce = ""

    func signIn() async throws -> (idToken: String, nonce: String) {
        let nonce = randomNonce()
        currentNonce = nonce

        return try await withCheckedThrowingContinuation { continuation in
            self.continuation = continuation

            let request = ASAuthorizationAppleIDProvider().createRequest()
            request.requestedScopes = [.fullName, .email]
            request.nonce = sha256(nonce)

            let controller = ASAuthorizationController(authorizationRequests: [request])
            controller.delegate = self
            controller.presentationContextProvider = self
            self.controller = controller  // retain until delegate fires
            controller.performRequests()
        }
    }

    // MARK: - Nonce

    private func randomNonce(length: Int = 32) -> String {
        var bytes = [UInt8](repeating: 0, count: length)
        _ = SecRandomCopyBytes(kSecRandomDefault, length, &bytes)
        return bytes.map { String(format: "%02x", $0) }.joined()
    }

    private func sha256(_ input: String) -> String {
        SHA256.hash(data: Data(input.utf8))
            .map { String(format: "%02x", $0) }
            .joined()
    }
}

// MARK: - ASAuthorizationControllerDelegate

extension AppleSignInCoordinator: ASAuthorizationControllerDelegate {

    nonisolated func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithAuthorization authorization: ASAuthorization
    ) {
        guard
            let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
            let tokenData = credential.identityToken,
            let idToken = String(data: tokenData, encoding: .utf8)
        else {
            Task { @MainActor in
                self.controller = nil
                continuation?.resume(throwing: AppleSignInError.missingToken)
                continuation = nil
            }
            return
        }

        Task { @MainActor in
            self.controller = nil
            continuation?.resume(returning: (idToken: idToken, nonce: currentNonce))
            continuation = nil
        }
    }

    nonisolated func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithError error: Error
    ) {
        Task { @MainActor in
            self.controller = nil
            continuation?.resume(throwing: error)
            continuation = nil
        }
    }
}

// MARK: - ASAuthorizationControllerPresentationContextProviding

extension AppleSignInCoordinator: ASAuthorizationControllerPresentationContextProviding {
    nonisolated func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .first?.keyWindow ?? ASPresentationAnchor()
    }
}

// MARK: - Error

enum AppleSignInError: LocalizedError {
    case missingToken
    var errorDescription: String? {
        "Apple Sign In failed: identity token was missing."
    }
}
