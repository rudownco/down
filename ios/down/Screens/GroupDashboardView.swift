import SwiftUI

struct GroupDashboardView: View {
    @StateObject private var viewModel: GroupDashboardViewModel
    let onLogout: () -> Void

    @State private var showCreateGroup       = false
    @State private var showLogoutConfirmation = false

    init(currentUser: User, onLogout: @escaping () -> Void = {}) {
        _viewModel = StateObject(
            wrappedValue: GroupDashboardViewModel(currentUser: currentUser)
        )
        self.onLogout = onLogout
    }

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            LinearGradient.appBackground.ignoresSafeArea()

            VStack(spacing: 0) {
                // Header — profile menu with sign-out
                NavHeader(
                    title: "My Crews",
                    trailing: AnyView(profileMenu)
                )

                ScrollView(showsIndicators: false) {
                    VStack(spacing: Spacing.lg) {
                        greetingSection
                        groupListSection
                    }
                    .padding(.horizontal, Spacing.md)
                    .padding(.vertical, Spacing.md)
                    .padding(.bottom, 100) // FAB clearance
                }
            }

            fabButton
        }
        .task { await viewModel.loadGroups() }
        // MARK: Create-group sheet
        .sheet(isPresented: $showCreateGroup) {
            CreateGroupView(currentUser: viewModel.currentUser) { newGroup in
                viewModel.addGroup(newGroup)
            }
        }
        // MARK: Logout confirmation
        .alert("Sign Out", isPresented: $showLogoutConfirmation) {
            Button("Sign Out", role: .destructive) {
                withAnimation(.easeInOut(duration: 0.3)) { onLogout() }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Are you sure you want to sign out?")
        }
        #if os(iOS)
        .toolbar(.hidden, for: .navigationBar)
        #endif
    }

    // MARK: Profile menu (trailing nav button)
    private var profileMenu: some View {
        Menu {
            Section(viewModel.currentUser.name) {
                Button(role: .destructive) {
                    showLogoutConfirmation = true
                } label: {
                    Label("Sign Out", systemImage: "rectangle.portrait.and.arrow.right")
                }
            }
        } label: {
            Image(systemName: "person.circle")
                .font(.system(size: 17, weight: .semibold))
                .foregroundStyle(Color.textOnBlue)
                .frame(width: 40, height: 40)
                .background(Color.overlayPanel)
                .clipShape(RoundedRectangle(cornerRadius: Radius.md))
        }
    }

    // MARK: Greeting
    private var greetingSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("\(viewModel.greeting) 👋")
                    .font(AppFont.subhead())
                    .foregroundStyle(Color.textOnBlueMuted)
                Text(
                    viewModel.currentUser.name
                        .components(separatedBy: " ").first
                        ?? viewModel.currentUser.name
                )
                .font(AppFont.title1())
                .foregroundStyle(Color.textOnBlue)
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
        } else if viewModel.groups.isEmpty {
            emptyGroupsView
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

    // MARK: Empty state
    private var emptyGroupsView: some View {
        VStack(spacing: Spacing.md) {
            Text("🏝️")
                .font(.system(size: 48))
            Text("No crews yet")
                .font(AppFont.headline())
                .foregroundStyle(Color.textOnBlue)
            Text("Tap + to create your first crew!")
                .font(AppFont.callout())
                .foregroundStyle(Color.textOnBlueMuted)
        }
        .frame(maxWidth: .infinity)
        .padding(Spacing.xxl)
        .overlayCard(cornerRadius: Radius.xxl)
    }

    // MARK: FAB
    private var fabButton: some View {
        Button { showCreateGroup = true } label: {
            Image(systemName: "plus")
                .font(.system(size: 22, weight: .bold))
                .foregroundStyle(Color.appBackground)
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
                        .init(color: .clear,                               location: phase - 0.3),
                        .init(color: Color(white: 1, opacity: 0.15),      location: phase),
                        .init(color: .clear,                               location: phase + 0.3),
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

// MARK: - Previews
#Preview {
    NavigationStack {
        GroupDashboardView(currentUser: MockUsers.currentUser, onLogout: {})
            .navigationDestination(for: DownGroup.self) { group in
                GroupDetailView(group: group, currentUser: MockUsers.currentUser)
            }
    }
}
