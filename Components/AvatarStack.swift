import SwiftUI

// MARK: - Overlapping Avatar Stack
struct AvatarStack: View {
    let users: [User]
    var maxVisible: Int = 3
    var size: CGFloat = AvatarSize.sm
    var borderColor: Color = .white
    var showCount: Bool = true

    private var visible: [User] { Array(users.prefix(maxVisible)) }
    private var overflow: Int  { max(0, users.count - maxVisible) }
    private var overlap: CGFloat { size * 0.35 }

    var body: some View {
        HStack(spacing: 0) {
            ZStack(alignment: .leading) {
                ForEach(Array(visible.enumerated()), id: \.element.id) { index, user in
                    AvatarView(user: user, size: size, borderColor: borderColor, borderWidth: 2)
                        .offset(x: CGFloat(index) * (size - overlap))
                        .zIndex(Double(visible.count - index))
                }

                if overflow > 0 && showCount {
                    overflowBadge
                        .offset(x: CGFloat(visible.count) * (size - overlap))
                }
            }
            .frame(width: totalWidth, height: size)
        }
    }

    private var totalWidth: CGFloat {
        let count = overflow > 0 && showCount ? visible.count + 1 : visible.count
        guard count > 0 else { return 0 }
        return size + CGFloat(count - 1) * (size - overlap)
    }

    private var overflowBadge: some View {
        ZStack {
            Circle()
                .fill(Color(white: 0.85))
                .frame(width: size, height: size)
                .overlay(Circle().strokeBorder(.white, lineWidth: 2))

            Text("+\(overflow)")
                .font(.system(size: size * 0.32, weight: .bold, design: .rounded))
                .foregroundStyle(.textSecondary)
        }
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: 20) {
        AvatarStack(users: MockUsers.all, maxVisible: 3, size: 32)
        AvatarStack(users: Array(MockUsers.all.prefix(2)), maxVisible: 3, size: 28)
        AvatarStack(users: MockUsers.all, maxVisible: 4, size: 40, borderColor: .appBackground)
    }
    .padding()
    .background(Color.appBackground)
}
