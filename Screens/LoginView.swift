import SwiftUI

struct LoginView: View {
    @StateObject private var viewModel = LoginViewModel()
    let onLogin: (User) -> Void

    var body: some View {
        ZStack {
            LinearGradient.appBackground.ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer()

                // Logo + branding
                VStack(spacing: Spacing.lg) {
                    Text("🎉")
                        .font(.system(size: 80))
                        .shadow(color: .black.opacity(0.2), radius: 12, x: 0, y: 6)

                    VStack(spacing: Spacing.xs) {
                        Text("Down")
                            .font(.system(size: 42, weight: .black, design: .rounded))
                            .foregroundStyle(.textOnBlue)

                        Text("Plan less. Vibe more.")
                            .font(AppFont.title3())
                            .foregroundStyle(.textOnBlueMuted)
                    }
                }

                Spacing.xxxl.spacer()

                // Decorative emoji row
                HStack(spacing: Spacing.lg) {
                    ForEach(["🍕", "🎬", "🎮", "☕", "🎸"], id: \.self) { emoji in
                        Text(emoji)
                            .font(.system(size: 28))
                    }
                }
                .padding(.horizontal, Spacing.md)
                .padding(.vertical, Spacing.sm)
                .background(Color.overlayPanel)
                .clipShape(Capsule())

                Spacing.xxxl.spacer()

                // Auth buttons
                VStack(spacing: Spacing.sm) {
                    authButton(
                        icon: "apple.logo",
                        label: "Continue with Apple",
                        provider: .apple
                    )

                    authButton(
                        icon: "globe",
                        label: "Continue with Google",
                        provider: .google
                    )
                }
                .padding(.horizontal, Spacing.md)

                Spacing.lg.spacer()

                // Terms
                Text("By continuing you agree to our Terms & Privacy Policy")
                    .font(AppFont.caption())
                    .foregroundStyle(.textOnBlueFaint)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, Spacing.xl)

                Spacer()
            }
        }
        .overlay {
            if viewModel.isLoading {
                loadingOverlay
            }
        }
    }

    // MARK: Auth button builder
    private func authButton(icon: String, label: String, provider: AuthProvider) -> some View {
        Button {
            Task {
                if let user = await viewModel.signIn(with: provider) {
                    onLogin(user)
                }
            }
        } label: {
            HStack(spacing: Spacing.sm) {
                Image(systemName: icon)
                    .font(.system(size: IconSize.md, weight: .semibold))
                Text(label)
                    .font(AppFont.headline())
            }
        }
        .appButtonStyle(.card)
    }

    // MARK: Loading overlay
    private var loadingOverlay: some View {
        ZStack {
            Color.black.opacity(0.35).ignoresSafeArea()
            VStack(spacing: Spacing.md) {
                ProgressView()
                    .tint(.white)
                    .scaleEffect(1.4)
                Text("Signing you in…")
                    .font(AppFont.subhead())
                    .foregroundStyle(.textOnBlue)
            }
            .padding(Spacing.xl)
            .background(Color.overlayPanel)
            .clipShape(RoundedRectangle(cornerRadius: Radius.xl))
        }
    }
}

// MARK: - CGFloat spacer helper
private extension CGFloat {
    func spacer() -> some View { Spacer().frame(height: self) }
}

// MARK: - Preview
#Preview {
    LoginView(onLogin: { _ in })
}
