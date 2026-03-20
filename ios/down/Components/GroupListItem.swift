import SwiftUI

// MARK: - Group List Card
struct GroupListItem: View {
    let group: DownGroup

    var body: some View {
        HStack(spacing: Spacing.md) {
            // Emoji badge
            ZStack {
                RoundedRectangle(cornerRadius: Radius.lg)
                    .fill(Color.overlayPanelMedium)
                    .frame(width: 56, height: 56)
                Text(group.emoji)
                    .font(.system(size: 28))
            }

            // Info
            VStack(alignment: .leading, spacing: Spacing.xxs) {
                Text(group.name)
                    .font(AppFont.headline())
                    .foregroundStyle(Color.textOnBlue)
                    .lineLimit(1)

                HStack(spacing: Spacing.xs) {
                    AvatarStack(
                        users: group.members,
                        maxVisible: 3,
                        size: AvatarSize.xs,
                        borderColor: .appBackground
                    )

                    Text(group.memberCountLabel)
                        .font(AppFont.caption())
                        .foregroundStyle(Color.textOnBlueMuted)
                }
            }

            Spacer(minLength: 0)

            // Right side: activity + unread badge
            VStack(alignment: .trailing, spacing: Spacing.xs) {
                if group.unreadCount > 0 {
                    Text("\(group.unreadCount)")
                        .font(AppFont.caption2())
                        .foregroundStyle(Color.appBackground)
                        .padding(.horizontal, 7)
                        .padding(.vertical, 3)
                        .background(Color.white)
                        .clipShape(Capsule())
                }

                Text(group.lastActivity)
                    .font(AppFont.caption())
                    .foregroundStyle(Color.textOnBlueFaint)
            }
        }
        .padding(Spacing.md)
        .background(Color.overlayPanel)
        .clipShape(RoundedRectangle(cornerRadius: Radius.xxl))
        .overlay(
            RoundedRectangle(cornerRadius: Radius.xxl)
                .strokeBorder(Color(white: 1.0, opacity: 0.18), lineWidth: 1)
        )
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: Spacing.sm) {
        GroupListItem(group: MockGroups.fridaySquad)
        GroupListItem(group: MockGroups.weekendWarriors)
        GroupListItem(group: MockGroups.workBuds)
    }
    .padding()
    .background(LinearGradient.appBackground)
}
