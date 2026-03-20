import SwiftUI

// MARK: - Single Avatar
struct AvatarLogo: View {
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
                .foregroundStyle(Color.white)
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
        AvatarLogo(user: MockUsers.alex, size: AvatarSize.xs)
        AvatarLogo(user: MockUsers.jamie, size: AvatarSize.sm)
        AvatarLogo(user: MockUsers.taylor, size: AvatarSize.md)
        AvatarLogo(user: MockUsers.morgan, size: AvatarSize.lg)
    }
    .padding()
    .background(Color.appBackground)
}
