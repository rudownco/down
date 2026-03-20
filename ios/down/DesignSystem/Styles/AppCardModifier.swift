import SwiftUI

// MARK: - Card Modifier
struct AppCardModifier: ViewModifier {
    var padding: CGFloat = Spacing.md
    var cornerRadius: CGFloat = Radius.xl
    var shadowRadius: CGFloat = 8

    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(Color.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
            .shadow(color: Color.black.opacity(0.10), radius: shadowRadius, x: 0, y: 3)
    }
}

// MARK: - Frosted Overlay Card Modifier (for cards sitting on blue bg)
struct OverlayCardModifier: ViewModifier {
    var padding: CGFloat = Spacing.md
    var cornerRadius: CGFloat = Radius.xl

    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(Color(white: 1.0, opacity: 0.16))
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .strokeBorder(Color(white: 1.0, opacity: 0.22), lineWidth: 1)
            )
    }
}

extension View {
    func appCard(padding: CGFloat = Spacing.md, cornerRadius: CGFloat = Radius.xl, shadowRadius: CGFloat = 8) -> some View {
        modifier(AppCardModifier(padding: padding, cornerRadius: cornerRadius, shadowRadius: shadowRadius))
    }

    func overlayCard(padding: CGFloat = Spacing.md, cornerRadius: CGFloat = Radius.xl) -> some View {
        modifier(OverlayCardModifier(padding: padding, cornerRadius: cornerRadius))
    }
}
