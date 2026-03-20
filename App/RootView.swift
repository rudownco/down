import SwiftUI

// MARK: - Root View
// Manages the top-level authenticated/unauthenticated split
// and owns the NavigationStack with all route destinations.
struct RootView: View {
    @State private var currentUser: User?

    var body: some View {
        Group {
            if let user = currentUser {
                authenticatedView(user: user)
            } else {
                LoginView { user in
                    withAnimation(.easeInOut(duration: 0.3)) {
                        currentUser = user
                    }
                }
            }
        }
    }

    // MARK: Authenticated navigation stack
    @ViewBuilder
    private func authenticatedView(user: User) -> some View {
        NavigationStack {
            GroupDashboardView(currentUser: user)
                // Route: Group detail
                .navigationDestination(for: AppRoute.self) { route in
                    routeDestination(route: route, currentUser: user)
                }
                // Also handle DownGroup directly (from GroupListItem links)
                .navigationDestination(for: DownGroup.self) { group in
                    GroupDetailView(group: group, currentUser: user)
                        .navigationDestination(for: AppRoute.self) { route in
                            routeDestination(route: route, currentUser: user)
                        }
                }
        }
    }

    // MARK: Route → View mapping
    @ViewBuilder
    private func routeDestination(route: AppRoute, currentUser: User) -> some View {
        switch route {
        case .groupDetail(let group):
            GroupDetailView(group: group, currentUser: currentUser)

        case .createEvent(let group):
            CreateEventView(group: group, currentUser: currentUser) { _ in
                // Created event handled via GroupDetailViewModel refresh
            }

        case .voting(let event, _):
            VotingView(event: event, currentUser: currentUser) { _ in }

        case .rsvp(let event, let group):
            RSVPView(
                event: event,
                currentUser: currentUser,
                groupMembers: group.members
            ) { _ in }
        }
    }
}

// MARK: - Preview
#Preview {
    RootView()
}

// MARK: - Pre-logged-in preview (bypasses login for faster iteration)
#Preview("Authenticated") {
    NavigationStack {
        GroupDashboardView(currentUser: MockUsers.currentUser)
            .navigationDestination(for: DownGroup.self) { group in
                GroupDetailView(group: group, currentUser: MockUsers.currentUser)
            }
            .navigationDestination(for: AppRoute.self) { route in
                switch route {
                case .groupDetail(let g):
                    GroupDetailView(group: g, currentUser: MockUsers.currentUser)
                case .createEvent(let g):
                    CreateEventView(group: g, currentUser: MockUsers.currentUser) { _ in }
                case .voting(let e, _):
                    VotingView(event: e, currentUser: MockUsers.currentUser) { _ in }
                case .rsvp(let e, let g):
                    RSVPView(event: e, currentUser: MockUsers.currentUser, groupMembers: g.members) { _ in }
                }
            }
    }
}
