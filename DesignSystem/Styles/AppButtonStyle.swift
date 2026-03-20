import SwiftUI

// MARK: - Button Style Variants
enum AppButtonVariant {
    case primary     // White background, blue text — main CTA
    case secondary   // Frosted overlay — secondary actions on blue bg
    case ghost       // Transparent with white border
    case danger      // Red tinted
    case card        // White card on blue — used for auth buttons
}

// MARK: - AppButtonStyle
struct AppButtonStyle: ButtonStyle {
    let variant: AppButtonVariant
    var fullWidth: Bool = true

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(AppFont.headline())
            .padding(.horizontal, Spacing.md)
            .padding(.vertical, Spacing.sm + 2)
            .frame(maxWidth: fullWidth ? .infinity : nil)
            .background(background(for: variant, pressed: configuration.isPressed))
            .foregroundStyle(foreground(for: variant))
            .clipShape(RoundedRectangle(cornerRadius: Radius.xl))
            .overlay(
                RoundedRectangle(cornerRadius: Radius.xl)
                    .strokeBorder(border(for: variant), lineWidth: borderWidth(for: variant))
            )
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .animation(.spring(duration: 0.2), value: configuration.isPressed)
    }

    private func background(for variant: AppButtonVariant, pressed: Bool) -> Color {
        let opacity = pressed ? 0.88 : 1.0
        switch variant {
        case .primary:   return .white.opacity(opacity)
        case .secondary: return Color(white: 1.0, opacity: pressed ? 0.28 : 0.18)
        case .ghost:     return Color(white: 1.0, opacity: pressed ? 0.12 : 0.0)
        case .danger:    return Color(red: 0.96, green: 0.24, blue: 0.24).opacity(opacity)
        case .card:      return .white.opacity(opacity)
        }
    }

    private func foreground(for variant: AppButtonVariant) -> Color {
        switch variant {
        case .primary:   return .appBackground
        case .secondary: return .textOnBlue
        case .ghost:     return .textOnBlue
        case .danger:    return .white
        case .card:      return .textPrimary
        }
    }

    private func border(for variant: AppButtonVariant) -> Color {
        switch variant {
        case .ghost:   return Color(white: 1.0, opacity: 0.40)
        case .card:    return .divider
        default:       return .clear
        }
    }

    private func borderWidth(for variant: AppButtonVariant) -> CGFloat {
        switch variant {
        case .ghost, .card: return 1
        default: return 0
        }
    }
}

extension Button {
    func appButtonStyle(_ variant: AppButtonVariant, fullWidth: Bool = true) -> some View {
        self.buttonStyle(AppButtonStyle(variant: variant, fullWidth: fullWidth))
    }
}
