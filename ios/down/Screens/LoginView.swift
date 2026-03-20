import SwiftUI

struct LoginView: View {
    @StateObject private var viewModel = LoginViewModel()
    let onLogin: (User) -> Void

    // Animation state
    @State private var showRU = false
    @State private var showDown = false
    @State private var shakeDown = false
    @State private var showEmoji = false
    @State private var emojiLevitate = false
    @State private var showContent = false

    var body: some View {
        ZStack {
            LinearGradient.appBackground.ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer()

                // Logo with drop animation — scales to screen width
                GeometryReader { geo in
                    let width = geo.size.width - Spacing.md * 2
                    VStack(spacing: 0) {
                        Text("r u")
                            .font(.system(size: width * 0.18, weight: .bold, design: .rounded))
                            .foregroundStyle(Color.textOnBlueMuted)
                            .offset(y: showRU ? 0 : -120)
                            .opacity(showRU ? 1 : 0)

                        Text("down?")
                            .font(.system(size: width * 0.26, weight: .black, design: .rounded))
                            .foregroundStyle(Color.textOnBlue)
                            .offset(y: showDown ? 0 : -160)
                            .opacity(showDown ? 1 : 0)
                            .rotationEffect(.degrees(shakeDown ? 3 : 0))

                        Text("👇")
                            .font(.system(size: width * 0.22))
                            .padding(.top, Spacing.xs)
                            .offset(y: showEmoji ? 0 : -200)
                            .opacity(showEmoji ? 1 : 0)
                            .offset(y: emojiLevitate ? -8 : 8)
                    }
                    .frame(maxWidth: .infinity)
                    .position(x: geo.size.width / 2, y: geo.size.height / 2)
                }
                .aspectRatio(1.5, contentMode: .fit)
                .multilineTextAlignment(.center)

                Spacing.xxxl.spacer()

                // Auth buttons
                VStack(spacing: Spacing.sm) {
                    authButton(provider: .apple) {
                        Image(systemName: "apple.logo")
                            .font(.system(size: IconSize.md, weight: .semibold))
                    }

                    authButton(provider: .google) {
                        googleLogo
                    }
                }
                .padding(.horizontal, Spacing.md)
                .opacity(showContent ? 1 : 0)
                .offset(y: showContent ? 0 : 20)

                Spacing.lg.spacer()

                // Terms
                Text("By continuing you agree to our Terms & Privacy Policy")
                    .font(AppFont.caption())
                    .foregroundStyle(Color.textOnBlueFaint)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, Spacing.xl)
                    .opacity(showContent ? 1 : 0)

                Spacer()
            }
        }
        .overlay {
            if viewModel.isLoading {
                loadingOverlay
            }
        }
        .onAppear { runEntryAnimation() }
    }

    // MARK: Entry animation sequence
    private func runEntryAnimation() {
        // "r u" drops in
        withAnimation(.spring(response: 0.5, dampingFraction: 0.7).delay(0.2)) {
            showRU = true
        }

        // "down?" drops in
        withAnimation(.spring(response: 0.5, dampingFraction: 0.65).delay(0.5)) {
            showDown = true
        }

        // "down?" shakes after landing
        withAnimation(.easeInOut(duration: 0.06).repeatCount(6, autoreverses: true).delay(0.85)) {
            shakeDown = true
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.3) {
            withAnimation(.easeOut(duration: 0.1)) { shakeDown = false }
        }

        // emoji drops in
        withAnimation(.spring(response: 0.5, dampingFraction: 0.6).delay(1.1)) {
            showEmoji = true
        }

        // emoji starts levitating after everything settles
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.7) {
            withAnimation(.easeInOut(duration: 1.2).repeatForever(autoreverses: true)) {
                emojiLevitate = true
            }
        }

        // buttons + terms fade in
        withAnimation(.easeOut(duration: 0.5).delay(1.5)) {
            showContent = true
        }
    }

    // MARK: Google logo
    private var googleLogo: some View {
        Image("GoogleLogo", bundle: .main)
            .resizable()
            .renderingMode(.original)
            .frame(width: IconSize.md, height: IconSize.md)
    }

    // MARK: Auth button builder
    private func authButton<Icon: View>(provider: AuthProvider, @ViewBuilder icon: () -> Icon) -> some View {
        let label = switch provider {
        case .apple: "Continue with Apple"
        case .google: "Continue with Google"
        }
        return Button {
            Task {
                if let user = await viewModel.signIn(with: provider) {
                    onLogin(user)
                }
            }
        } label: {
            HStack(spacing: Spacing.sm) {
                icon()
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
                    .foregroundStyle(Color.textOnBlue)
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
