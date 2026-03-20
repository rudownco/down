import SwiftUI

struct GroupDetailView: View {
    @StateObject private var viewModel: GroupDetailViewModel
    @State private var navigationPath = NavigationPath()

    init(group: DownGroup, currentUser: User) {
        _viewModel = StateObject(wrappedValue: GroupDetailViewModel(group: group, currentUser: currentUser))
    }

    var body: some View {
        ZStack {
            LinearGradient.appBackground.ignoresSafeArea()

            VStack(spacing: 0) {
                NavHeader(
                    title: viewModel.group.name,
                    onBack: nil, // NavigationStack handles back
                    trailing: AnyView(NavIconButton(systemName: "gearshape") {})
                )

                ScrollView(showsIndicators: false) {
                    VStack(spacing: Spacing.xl) {
                        membersSection
                        eventsSection
                    }
                    .padding(.horizontal, Spacing.md)
                    .padding(.vertical, Spacing.md)
                    .padding(.bottom, Spacing.xl)
                }
            }
        }
        .task { await viewModel.loadEvents() }
        #if os(iOS)
        .toolbar(.hidden, for: .navigationBar)
        #endif
    }

    // MARK: Members section
    private var membersSection: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            Text("Members")
                .font(AppFont.subhead())
                .foregroundStyle(Color.textOnBlueMuted)
                .padding(.horizontal, 2)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.sm) {
                    ForEach(viewModel.group.members) { member in
                        memberChip(member)
                    }
                    inviteButton
                }
                .padding(.horizontal, 2)
            }
        }
    }

    private func memberChip(_ user: User) -> some View {
        VStack(spacing: Spacing.xxs) {
            AvatarView(user: user, size: AvatarSize.md, borderColor: .white, borderWidth: 2)
            Text(user.name.components(separatedBy: " ").first ?? user.name)
                .font(AppFont.caption2())
                .foregroundStyle(Color.textOnBlueMuted)
                .lineLimit(1)
        }
        .frame(width: 52)
    }

    private var inviteButton: some View {
        VStack(spacing: Spacing.xxs) {
            ZStack {
                Circle()
                    .fill(Color.overlayPanelMedium)
                    .frame(width: AvatarSize.md, height: AvatarSize.md)
                Image(systemName: "plus")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(Color.textOnBlue)
            }
            Text("Invite")
                .font(AppFont.caption2())
                .foregroundStyle(Color.textOnBlueMuted)
        }
        .frame(width: 52)
    }

    // MARK: Events section
    private var eventsSection: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            HStack {
                Text("Events")
                    .font(AppFont.subhead())
                    .foregroundStyle(Color.textOnBlueMuted)
                Spacer()

                NavigationLink(
                    value: AppRoute.createEvent(viewModel.group)
                ) {
                    HStack(spacing: 4) {
                        Image(systemName: "plus")
                        Text("Suggest")
                    }
                    .font(AppFont.subhead())
                    .foregroundStyle(Color.textOnBlue)
                    .padding(.horizontal, Spacing.sm)
                    .padding(.vertical, Spacing.xxs + 2)
                    .background(Color.overlayPanel)
                    .clipShape(Capsule())
                }
            }
            .padding(.horizontal, 2)

            if viewModel.isLoading {
                eventSkeletons
            } else if viewModel.events.isEmpty {
                emptyEventsView
            } else {
                eventsList
            }
        }
    }

    private var eventsList: some View {
        VStack(spacing: Spacing.sm) {
            ForEach(viewModel.events) { event in
                eventNavigationLink(for: event)
            }
        }
    }

    @ViewBuilder
    private func eventNavigationLink(for event: EventSuggestion) -> some View {
        let route: AppRoute = {
            switch event.status {
            case .voting:    return .voting(event, viewModel.group)
            case .confirmed: return .rsvp(event, viewModel.group)
            case .pending:   return .voting(event, viewModel.group)
            }
        }()

        NavigationLink(value: route) {
            EventSuggestionCard(event: event)
        }
        .buttonStyle(.plain)
    }

    private var eventSkeletons: some View {
        VStack(spacing: Spacing.sm) {
            ForEach(0..<2, id: \.self) { _ in
                RoundedRectangle(cornerRadius: Radius.xxl)
                    .fill(Color.cardBackground.opacity(0.5))
                    .frame(height: 140)
            }
        }
    }

    private var emptyEventsView: some View {
        VStack(spacing: Spacing.md) {
            Text("🗓️")
                .font(.system(size: 48))
            Text("No events yet")
                .font(AppFont.headline())
                .foregroundStyle(Color.textOnBlue)
            Text("Suggest something fun for the crew!")
                .font(AppFont.callout())
                .foregroundStyle(Color.textOnBlueMuted)
        }
        .frame(maxWidth: .infinity)
        .padding(Spacing.xxl)
        .overlayCard(cornerRadius: Radius.xxl)
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        GroupDetailView(group: MockGroups.fridaySquad, currentUser: MockUsers.currentUser)
    }
}
