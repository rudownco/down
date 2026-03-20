import SwiftUI

// MARK: - Single Avatar
struct AvatarView: View {
    let user: User
    var size: CGFloat = AvatarSize.sm
    var borderColor: Color = .clear
    var borderWidth: CGFloat = 0

    var body: some View {
        ZStack {
            Circle()
                .fill(user.avatarColor)

            Text(user.initials)
                .font(.system(size: size * 0.36, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
        }
        .frame(width: size, height: size)
        .overlay(
            Circle()
                .strokeBorder(borderColor, lineWidth: borderWidth)
        )
    }
}

// MARK: - Preview
#Preview {
    HStack(spacing: 12) {
        AvatarView(user: MockUsers.alex, size: AvatarSize.xs)
        AvatarView(user: MockUsers.jamie, size: AvatarSize.sm)
        AvatarView(user: MockUsers.taylor, size: AvatarSize.md)
        AvatarView(user: MockUsers.morgan, size: AvatarSize.lg)
    }
    .padding()
    .background(Color.appBackground)
}
