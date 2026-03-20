import SwiftUI

// MARK: - Individual Voting Option Row
struct VoteRow: View {
    let option: VotingOption
    let totalVoters: Int
    let isSelected: Bool
    let isLeading: Bool
    let onTap: () -> Void

    private var percentage: Double {
        guard totalVoters > 0 else { return 0 }
        return Double(option.votes) / Double(totalVoters)
    }

    private var rowEmoji: String {
        if isSelected { return "✅" }
        if isLeading  { return "🔥" }
        return "📅"
    }

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: Spacing.sm) {
                // Top row: emoji + date/time + voter count
                HStack {
                    Text(rowEmoji)
                        .font(.system(size: 20))

                    VStack(alignment: .leading, spacing: 2) {
                        Text(option.date)
                            .font(AppFont.subhead())
                            .foregroundStyle(isSelected ? Color.accentBlue : Color.textPrimary)
                        Text(option.time)
                            .font(AppFont.footnote())
                            .foregroundStyle(isSelected ? Color.accentBlue.opacity(0.7) : Color.textSecondary)
                    }

                    Spacer()

                    HStack(spacing: Spacing.xs) {
                        AvatarStack(users: option.voters, maxVisible: 3, size: AvatarSize.xs, borderColor: .white)
                        Text("\(option.votes)")
                            .font(AppFont.subhead())
                            .foregroundStyle(isSelected ? Color.accentBlue : Color.textSecondary)
                    }
                }

                // Progress bar
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: Radius.full)
                            .fill(isSelected ? Color.accentBlueMuted : Color.inputBackground)
                            .frame(height: 6)

                        RoundedRectangle(cornerRadius: Radius.full)
                            .fill(isSelected ? Color.accentBlue : Color.statusPendingFg.opacity(0.5))
                            .frame(width: geo.size.width * CGFloat(percentage), height: 6)
                            .animation(.spring(duration: 0.4), value: percentage)
                    }
                }
                .frame(height: 6)
            }
            .padding(Spacing.md)
            .background(isSelected ? Color.accentBlueMuted : Color.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: Radius.xl))
            .overlay(
                RoundedRectangle(cornerRadius: Radius.xl)
                    .strokeBorder(
                        isSelected ? Color.accentBlue : Color.divider,
                        lineWidth: isSelected ? 2 : 1
                    )
            )
            .scaleEffect(isSelected ? 1.02 : 1.0)
            .animation(.spring(duration: 0.25), value: isSelected)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: Spacing.sm) {
        VoteRow(
            option: MockVotingOptions.pizzaOptions[0],
            totalVoters: 7,
            isSelected: true,
            isLeading: false,
            onTap: {}
        )
        VoteRow(
            option: MockVotingOptions.pizzaOptions[1],
            totalVoters: 7,
            isSelected: false,
            isLeading: true,
            onTap: {}
        )
        VoteRow(
            option: MockVotingOptions.pizzaOptions[2],
            totalVoters: 7,
            isSelected: false,
            isLeading: false,
            onTap: {}
        )
    }
    .padding()
    .background(LinearGradient.appBackground)
}
