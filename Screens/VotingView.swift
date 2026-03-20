import SwiftUI

struct VotingView: View {
    @StateObject private var viewModel: VotingViewModel
    @Environment(\.dismiss) private var dismiss
    let onVoted: (EventSuggestion) -> Void

    init(event: EventSuggestion, currentUser: User, onVoted: @escaping (EventSuggestion) -> Void) {
        _viewModel = StateObject(wrappedValue: VotingViewModel(event: event, currentUser: currentUser))
        self.onVoted = onVoted
    }

    var body: some View {
        ZStack {
            LinearGradient.appBackground.ignoresSafeArea()

            VStack(spacing: 0) {
                NavHeader(title: "Vote", onBack: { dismiss() })

                ScrollView(showsIndicators: false) {
                    VStack(spacing: Spacing.lg) {
                        eventInfoCard
                        votingSection
                        submitButton
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
        .alert("Votes submitted! 🎉", isPresented: $viewModel.didSubmit) {
            Button("Back to group") {
                onVoted(viewModel.event)
                dismiss()
            }
        } message: {
            let count = viewModel.selectedOptionIds.count
            Text("You voted for \(count) time\(count == 1 ? "" : "s").")
        }
    }

    // MARK: Event info card
    private var eventInfoCard: some View {
        HStack(alignment: .top, spacing: Spacing.sm) {
            Text(viewModel.event.emoji)
                .font(.system(size: 36))

            VStack(alignment: .leading, spacing: Spacing.xs) {
                Text(viewModel.event.title)
                    .font(AppFont.title3())
                    .foregroundStyle(Color.textOnBlue)

                if let desc = viewModel.event.description {
                    Text(desc)
                        .font(AppFont.callout())
                        .foregroundStyle(Color.textOnBlueMuted)
                        .lineLimit(2)
                }

                HStack(spacing: Spacing.md) {
                    if let location = viewModel.event.location {
                        Label(location, systemImage: "mappin.and.ellipse")
                    }
                    Label("\(viewModel.event.totalVoters) voters", systemImage: "person.2")
                }
                .font(AppFont.caption())
                .foregroundStyle(Color.textOnBlueFaint)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .overlayCard()
    }

    // MARK: Voting options
    private var votingSection: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            VStack(alignment: .leading, spacing: 4) {
                Text("📅 Pick your times")
                    .font(AppFont.headline())
                    .foregroundStyle(Color.textOnBlue)
                Text("Select all times that work for you")
                    .font(AppFont.footnote())
                    .foregroundStyle(Color.textOnBlueMuted)
            }

            VStack(spacing: Spacing.sm) {
                ForEach(viewModel.event.votingOptions) { option in
                    VoteRow(
                        option: option,
                        totalVoters: max(1, viewModel.event.totalVoters),
                        isSelected: viewModel.isSelected(option.id),
                        isLeading: viewModel.isLeading(option.id),
                        onTap: { viewModel.toggle(optionId: option.id) }
                    )
                }
            }
        }
    }

    // MARK: Submit button
    private var submitButton: some View {
        Button {
            Task { _ = await viewModel.submitVotes() }
        } label: {
            Group {
                if viewModel.isSubmitting {
                    HStack(spacing: Spacing.sm) {
                        ProgressView().tint(.appBackground)
                        Text("Submitting…")
                    }
                } else {
                    let count = viewModel.selectedOptionIds.count
                    Text(count == 0
                        ? "Select at least one time"
                        : "🗳️  Submit \(count) Vote\(count == 1 ? "" : "s")"
                    )
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
        VotingView(
            event: MockEvents.pizzaNight,
            currentUser: MockUsers.currentUser,
            onVoted: { _ in }
        )
    }
}
