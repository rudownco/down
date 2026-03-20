import SwiftUI

// MARK: - Status Badge
struct EventStatusBadge: View {
    let status: EventStatus

    var body: some View {
        HStack(spacing: 4) {
            Text(status.emoji)
                .font(.system(size: 11))
            Text(status.label)
                .font(AppFont.caption2())
        }
        .padding(.horizontal, Spacing.xs)
        .padding(.vertical, 4)
        .background(badgeBg)
        .foregroundStyle(badgeFg)
        .clipShape(Capsule())
    }

    private var badgeBg: Color {
        switch status {
        case .voting:    return .statusVotingBg
        case .confirmed: return .statusConfirmedBg
        case .pending:   return .statusPendingBg
        }
    }

    private var badgeFg: Color {
        switch status {
        case .voting:    return .statusVotingFg
        case .confirmed: return .statusConfirmedFg
        case .pending:   return .statusPendingFg
        }
    }
}

// MARK: - Event Suggestion Card
struct EventSuggestionCard: View {
    let event: EventSuggestion

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {

            // Header row: emoji + title + status badge
            HStack(alignment: .top, spacing: Spacing.sm) {
                Text(event.emoji)
                    .font(.system(size: 28))

                VStack(alignment: .leading, spacing: 4) {
                    Text(event.title)
                        .font(AppFont.title3())
                        .foregroundStyle(.textPrimary)
                        .lineLimit(1)

                    Text("by \(event.suggestedBy.name)")
                        .font(AppFont.caption())
                        .foregroundStyle(.textSecondary)
                }

                Spacer()

                EventStatusBadge(status: event.status)
            }

            // Description
            if let desc = event.description {
                Text(desc)
                    .font(AppFont.callout())
                    .foregroundStyle(.textSecondary)
                    .lineLimit(2)
            }

            // Meta info row
            if event.location != nil || event.date != nil || event.time != nil {
                HStack(spacing: Spacing.md) {
                    if let location = event.location {
                        Label(location, systemImage: "mappin.and.ellipse")
                            .lineLimit(1)
                    }
                    if let date = event.date {
                        Label(date, systemImage: "calendar")
                            .lineLimit(1)
                    }
                    if let time = event.time {
                        Label(time, systemImage: "clock")
                    }
                }
                .font(AppFont.caption())
                .foregroundStyle(.textSecondary)
                .labelStyle(.titleAndIcon)
            }

            Divider()
                .background(Color.divider)

            // Bottom: voting progress OR attendees
            if event.status == .voting && !event.votingOptions.isEmpty {
                votingProgressRow
            } else {
                attendeesRow
            }
        }
        .appCard(padding: Spacing.md, cornerRadius: Radius.xxl)
    }

    // MARK: Voting progress row
    private var votingProgressRow: some View {
        HStack {
            Image(systemName: "hand.raised.fill")
                .font(.system(size: IconSize.sm))
                .foregroundStyle(.statusVotingFg)

            Text("\(event.totalVoters) vote\(event.totalVoters == 1 ? "" : "s") cast")
                .font(AppFont.subhead())
                .foregroundStyle(.textSecondary)

            Spacer()

            Text("Tap to vote")
                .font(AppFont.caption())
                .foregroundStyle(.accentBlue)
        }
    }

    // MARK: Attendees row
    private var attendeesRow: some View {
        HStack {
            AvatarStack(users: event.attendees, maxVisible: 4, size: AvatarSize.xs, borderColor: .white)

            if !event.attendees.isEmpty {
                Text("\(event.attendees.count) going")
                    .font(AppFont.subhead())
                    .foregroundStyle(.textSecondary)
            }

            Spacer()
        }
    }
}

// MARK: - Preview
#Preview {
    ScrollView {
        VStack(spacing: Spacing.sm) {
            EventSuggestionCard(event: MockEvents.pizzaNight)
            EventSuggestionCard(event: MockEvents.movieMarathon)
            EventSuggestionCard(event: MockEvents.coffeeRun)
        }
        .padding()
    }
    .background(LinearGradient.appBackground)
}
