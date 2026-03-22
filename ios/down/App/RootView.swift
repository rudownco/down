import SwiftUI
import Supabase

// MARK: - Root View
// Manages the top-level authenticated / unauthenticated split and owns
// the single NavigationStack with ALL route destinations registered here.
struct RootView: View {
    @State private var currentUser: User?
    @State private var isRestoringSession = true

    private let authService = SupabaseService()

    var body: some View {
        Group {
            if isRestoringSession {
                Color.clear
            } else if let user = currentUser {
                authenticatedView(user: user)
            } else {
                LoginView { user in
                    withAnimation(.easeInOut(duration: 0.3)) {
                        currentUser = user
                    }
                }
            }
        }
        .task {
            if let restored = await authService.restoreSession() {
                currentUser = restored
            }
            isRestoringSession = false
        }
        .onOpenURL { url in
            Task {
                guard let session = try? await supabase.auth.session(from: url) else { return }
                supabase.functions.setAuth(token: session.accessToken)
                let meta = session.user.userMetadata
                let name: String = {
                    if case .string(let v) = meta["full_name"] { return v }
                    if case .string(let v) = meta["name"]      { return v }
                    return session.user.email ?? "User"
                }()
                withAnimation(.easeInOut(duration: 0.3)) {
                    currentUser = User(id: session.user.id.uuidString, name: name)
                }
            }
        }
    }

    // MARK: Authenticated navigation stack
    @ViewBuilder
    private func authenticatedView(user: User) -> some View {
        NavigationStack {
            GroupDashboardView(
                currentUser: user,
                onLogout: {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        currentUser = nil
                    }
                }
            )
            // DownGroup → GroupDetailView
            .navigationDestination(for: DownGroup.self) { group in
                GroupDetailView(group: group, currentUser: user)
            }
            // AppRoute → all deeper destinations
            .navigationDestination(for: AppRoute.self) { route in
                routeDestination(route: route, currentUser: user)
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
            // onCreated is a no-op here: GroupDetailView reloads via .onAppear
            // when it regains focus after this view is dismissed.
            CreateEventView(group: group, currentUser: currentUser) { _ in }

        case .voting(let event, _):
            // onVoted is a no-op: same reload strategy as above.
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

// MARK: - Previews

/// Full flow preview — starts at login screen
#Preview("Login → Dashboard") {
    RootView()
}

/// Skip login — jump straight into the authenticated stack
#Preview("Authenticated") {
    NavigationStack {
        GroupDashboardView(
            currentUser: MockUsers.currentUser,
            onLogout: {}
        )
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

/// Deep-link preview — opens directly on a group detail
#Preview("Group Detail") {
    NavigationStack {
        GroupDetailView(
            group: MockGroups.fridaySquad,
            currentUser: MockUsers.currentUser
        )
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
