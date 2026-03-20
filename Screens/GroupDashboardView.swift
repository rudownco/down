import SwiftUI

struct GroupDashboardView: View {
    @StateObject private var viewModel: GroupDashboardViewModel
    @State private var showCreateGroup = false

    init(currentUser: User) {
        _viewModel = StateObject(wrappedValue: GroupDashboardViewModel(currentUser: currentUser))
    }

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            LinearGradient.appBackground.ignoresSafeArea()

            VStack(spacing: 0) {
                // Header
                NavHeader(
                    title: "My Crews",
                    trailing: AnyView(NavIconButton(systemName: "magnifyingglass") {})
                )

                ScrollView(showsIndicators: false) {
                    VStack(spacing: Spacing.lg) {
                        // Greeting
                        greetingSection

                        // Group list
                        groupListSection
                    }
                    .padding(.horizontal, Spacing.md)
                    .padding(.vertical, Spacing.md)
                    .padding(.bottom, 100) // FAB clearance
                }
            }

            // Floating Action Button
            fabButton
        }
        .task { await viewModel.loadGroups() }
        .navigationBarHidden(true)
    }

    // MARK: Greeting
    private var greetingSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("\(viewModel.greeting) 👋")
                    .font(AppFont.subhead())
                    .foregroundStyle(.textOnBlueMuted)
                Text(viewModel.currentUser.name.components(separatedBy: " ").first ?? viewModel.currentUser.name)
                    .font(AppFont.title1())
                    .foregroundStyle(.textOnBlue)
            }
            Spacer()
        }
    }

    // MARK: Group list
    @ViewBuilder
    private var groupListSection: some View {
        if viewModel.isLoading {
            VStack(spacing: Spacing.sm) {
                ForEach(0..<3, id: \.self) { _ in
                    RoundedRectangle(cornerRadius: Radius.xxl)
                        .fill(Color.overlayPanel)
                        .frame(height: 80)
                        .shimmer()
                }
            }
        } else {
            VStack(spacing: Spacing.sm) {
                ForEach(viewModel.groups) { group in
                    NavigationLink(value: group) {
                        GroupListItem(group: group)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    // MARK: FAB
    private var fabButton: some View {
        Button {
            showCreateGroup = true
        } label: {
            Image(systemName: "plus")
                .font(.system(size: 22, weight: .bold))
                .foregroundStyle(.appBackground)
                .frame(width: 56, height: 56)
                .background(Color.white)
                .clipShape(Circle())
                .shadow(color: .black.opacity(0.25), radius: 10, x: 0, y: 4)
        }
        .padding(.trailing, Spacing.lg)
        .padding(.bottom, Spacing.xl)
    }
}

// MARK: - Shimmer Effect
private struct ShimmerModifier: ViewModifier {
    @State private var phase: CGFloat = -1.0

    func body(content: Content) -> some View {
        content
            .overlay(
                LinearGradient(
                    gradient: Gradient(stops: [
                        .init(color: .clear, location: phase - 0.3),
                        .init(color: Color(white: 1, opacity: 0.15), location: phase),
                        .init(color: .clear, location: phase + 0.3),
                    ]),
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .onAppear {
                withAnimation(.linear(duration: 1.2).repeatForever(autoreverses: false)) {
                    phase = 1.5
                }
            }
    }
}

private extension View {
    func shimmer() -> some View { modifier(ShimmerModifier()) }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        GroupDashboardView(currentUser: MockUsers.currentUser)
    }
}
