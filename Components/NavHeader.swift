import SwiftUI

// MARK: - Custom Navigation Header
struct NavHeader: View {
    let title: String
    var onBack: (() -> Void)? = nil
    var trailing: AnyView? = nil

    var body: some View {
        ZStack {
            // Centered title
            Text(title)
                .font(AppFont.headline())
                .foregroundStyle(.textOnBlue)
                .lineLimit(1)

            HStack {
                // Back button
                if let onBack {
                    Button(action: onBack) {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundStyle(.textOnBlue)
                            .frame(width: 40, height: 40)
                            .background(Color.overlayPanel)
                            .clipShape(RoundedRectangle(cornerRadius: Radius.md))
                    }
                } else {
                    Color.clear.frame(width: 40, height: 40)
                }

                Spacer()

                // Trailing action
                if let trailing {
                    trailing
                } else {
                    Color.clear.frame(width: 40, height: 40)
                }
            }
        }
        .padding(.horizontal, Spacing.md)
        .frame(height: 56)
    }
}

// MARK: - Icon button helper for trailing slots
struct NavIconButton: View {
    let systemName: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: systemName)
                .font(.system(size: 17, weight: .semibold))
                .foregroundStyle(.textOnBlue)
                .frame(width: 40, height: 40)
                .background(Color.overlayPanel)
                .clipShape(RoundedRectangle(cornerRadius: Radius.md))
        }
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: 0) {
        NavHeader(title: "My Crews",
                  trailing: AnyView(NavIconButton(systemName: "magnifyingglass") {}))
        NavHeader(title: "Friday Squad",
                  onBack: {},
                  trailing: AnyView(NavIconButton(systemName: "gearshape") {}))
        NavHeader(title: "Create Event", onBack: {})
    }
    .background(LinearGradient.appBackground)
}
