import SwiftUI

struct RSVPView: View {
    @StateObject private var viewModel: RSVPViewModel
    @Environment(\.dismiss) private var dismiss
    let onConfirmed: (EventSuggestion) -> Void

    init(event: EventSuggestion, currentUser: User, groupMembers: [User], onConfirmed: @escaping (EventSuggestion) -> Void) {
        _viewModel = StateObject(wrappedValue: RSVPViewModel(
            event: event,
            currentUser: currentUser,
            groupMembers: groupMembers
        ))
        self.onConfirmed = onConfirmed
    }

    var body: some View {
        ZStack {
            LinearGradient.appBackground.ignoresSafeArea()

            VStack(spacing: 0) {
                NavHeader(title: "RSVP", onBack: { dismiss() })

                ScrollView(showsIndicators: false) {
                    VStack(spacing: Spacing.lg) {
                        eventHeroCard
                        rsvpSection
                        attendeesSection
                        confirmButton
                    }
                    .padding(.horizontal, Spacing.md)
                    .padding(.vertical, Spacing.md)
                    .padding(.bottom, Spacing.xxxl)
                }
            }
        }
        #if os(iOS)
        .toolbar(.hidden, for: .navigationBar)
        #endif
        .alert("You're in! 🎉", isPresented: $viewModel.didSubmit) {
            Button("Sweet!") {
                onConfirmed(viewModel.event)
                dismiss()
            }
        } message: {
            if let status = viewModel.selectedStatus {
                Text("RSVP saved: \(status.emoji) \(status.label)")
            }
        }
    }

    // MARK: Event hero card
    private var eventHeroCard: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            // Top: emoji + title + status
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: Spacing.xs) {
                    Text(viewModel.event.emoji)
                        .font(.system(size: 40))
                    Text(viewModel.event.title)
                        .font(AppFont.title2())
                        .foregroundStyle(Color.textPrimary)
                }
                Spacer()
                EventStatusBadge(status: viewModel.event.status)
            }

            if let desc = viewModel.event.description {
                Text(desc)
                    .font(AppFont.callout())
                    .foregroundStyle(Color.textSecondary)
                    .lineLimit(3)
            }

            Divider().background(Color.divider)

            // Detail grid
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: Spacing.sm) {
                if let date = viewModel.event.date {
                    detailCell(icon: "calendar", value: date)
                }
                if let time = viewModel.event.time {
                    detailCell(icon: "clock", value: time)
                }
                if let location = viewModel.event.location {
                    detailCell(icon: "mappin.and.ellipse", value: location)
                }
                detailCell(icon: "person.2", value: "\(viewModel.event.attendees.count) attending")
            }
        }
        .appCard(padding: Spacing.md, cornerRadius: Radius.xxl)
    }

    private func detailCell(icon: String, value: String) -> some View {
        HStack(spacing: Spacing.xs) {
            Image(systemName: icon)
                .font(.system(size: IconSize.sm))
                .foregroundStyle(Color.accentBlue)
                .frame(width: 20)
            Text(value)
                .font(AppFont.footnote())
                .foregroundStyle(Color.textSecondary)
                .lineLimit(2)
            Spacer()
        }
        .padding(Spacing.sm)
        .background(Color.cardBackgroundSecondary)
        .clipShape(RoundedRectangle(cornerRadius: Radius.md))
    }

    // MARK: RSVP selector section
    private var rsvpSection: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            Text("Are you down? 👇")
                .font(AppFont.title3())
                .foregroundStyle(Color.textOnBlue)

            RSVPSelector(selectedStatus: $viewModel.selectedStatus)
        }
    }

    // MARK: Attendees section
    @ViewBuilder
    private var attendeesSection: some View {
        let going    = viewModel.usersForStatus(.going)
        let maybe    = viewModel.usersForStatus(.maybe)
        let notGoing = viewModel.usersForStatus(.notGoing)

        if !going.isEmpty || !maybe.isEmpty || !notGoing.isEmpty {
            VStack(alignment: .leading, spacing: Spacing.sm) {
                Text("Who's who")
                    .font(AppFont.subhead())
                    .foregroundStyle(Color.textOnBlueMuted)

                VStack(spacing: Spacing.xs) {
                    if !going.isEmpty    { attendeeRow(status: .going,    users: going) }
                    if !maybe.isEmpty    { attendeeRow(status: .maybe,    users: maybe) }
                    if !notGoing.isEmpty { attendeeRow(status: .notGoing, users: notGoing) }
                }
                .appCard(padding: Spacing.sm, cornerRadius: Radius.xl)
            }
        }
    }

    private func attendeeRow(status: RSVPStatus, users: [User]) -> some View {
        HStack(spacing: Spacing.sm) {
            Text(status.emoji)
                .font(.system(size: 18))
                .frame(width: 28)

            Text(status.label)
                .font(AppFont.subhead())
                .foregroundStyle(Color.textSecondary)
                .frame(width: 56, alignment: .leading)

            // Chips
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.xs) {
                    ForEach(users) { user in
                        Text(user.name.components(separatedBy: " ").first ?? user.name)
                            .font(AppFont.caption())
                            .foregroundStyle(Color.white)
                            .padding(.horizontal, Spacing.xs)
                            .padding(.vertical, 4)
                            .background(user.avatarColor)
                            .clipShape(Capsule())
                    }
                }
            }
        }
        .padding(.vertical, Spacing.xs)
    }

    // MARK: Confirm button
    private var confirmButton: some View {
        Button {
            Task { _ = await viewModel.confirmRSVP() }
        } label: {
            Group {
                if viewModel.isSubmitting {
                    HStack(spacing: Spacing.sm) {
                        ProgressView().tint(.appBackground)
                        Text("Saving…")
                    }
                } else if let status = viewModel.selectedStatus {
                    Text("\(status.emoji)  \(status.label == "Can't" ? "Can't make it" : "I'm \(status.label)!")  ")
                } else {
                    Text("Select your RSVP above")
                }
            }
        }
        .appButtonStyle(.primary)
        .disabled(!viewModel.canSubmit || viewModel.isSubmitting)
        .opacity(viewModel.canSubmit ? 1.0 : 0.5)
        .padding(.horizontal, Spacing.md)
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        RSVPView(
            event: MockEvents.movieMarathon,
            currentUser: MockUsers.currentUser,
            groupMembers: MockGroups.fridaySquad.members,
            onConfirmed: { _ in }
        )
    }
}
