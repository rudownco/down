import SwiftUI

// MARK: - App Color Palette
extension Color {

    // MARK: Backgrounds
    /// Primary app background — rich royal blue
    static let appBackground      = Color(red: 0.118, green: 0.247, blue: 0.686)
    /// Deeper variant used for gradients / top of screen
    static let appBackgroundDeep  = Color(red: 0.078, green: 0.165, blue: 0.541)
    /// Frosted overlay panels sitting on top of blue
    static let overlayPanel       = Color(white: 1.0, opacity: 0.14)
    static let overlayPanelMedium = Color(white: 1.0, opacity: 0.22)

    // MARK: Card Surfaces
    static let cardBackground          = Color.white
    static let cardBackgroundSecondary = Color(red: 0.941, green: 0.953, blue: 1.0)

    // MARK: Text — on blue backgrounds
    static let textOnBlue       = Color.white
    static let textOnBlueMuted  = Color(white: 1.0, opacity: 0.65)
    static let textOnBlueFaint  = Color(white: 1.0, opacity: 0.38)

    // MARK: Text — on white / card surfaces
    static let textPrimary   = Color(red: 0.082, green: 0.098, blue: 0.200)
    static let textSecondary = Color(red: 0.431, green: 0.467, blue: 0.569)
    static let textTertiary  = Color(red: 0.698, green: 0.718, blue: 0.784)

    // MARK: Accent
    static let accentBlue      = Color(red: 0.255, green: 0.467, blue: 0.969)
    static let accentBlueMuted = Color(red: 0.878, green: 0.906, blue: 1.0)

    // MARK: Status
    static let statusVotingFg      = Color(red: 0.820, green: 0.490, blue: 0.016)
    static let statusVotingBg      = Color(red: 1.000, green: 0.937, blue: 0.780)
    static let statusConfirmedFg   = Color(red: 0.102, green: 0.627, blue: 0.310)
    static let statusConfirmedBg   = Color(red: 0.847, green: 0.969, blue: 0.906)
    static let statusPendingFg     = Color(red: 0.490, green: 0.522, blue: 0.620)
    static let statusPendingBg     = Color(red: 0.933, green: 0.937, blue: 0.961)

    // MARK: UI Chrome
    static let divider        = Color(red: 0.898, green: 0.910, blue: 0.941)
    static let inputBackground = Color(red: 0.953, green: 0.961, blue: 0.984)
    static let inputBorder     = Color(red: 0.820, green: 0.839, blue: 0.898)

    // MARK: Avatar palette (deterministic by user name hash)
    static let avatarPalette: [Color] = [
        Color(red: 0.996, green: 0.420, blue: 0.420),
        Color(red: 0.306, green: 0.804, blue: 0.769),
        Color(red: 0.271, green: 0.718, blue: 0.820),
        Color(red: 0.588, green: 0.808, blue: 0.706),
        Color(red: 0.996, green: 0.714, blue: 0.404),
        Color(red: 0.776, green: 0.506, blue: 0.965),
        Color(red: 0.310, green: 0.761, blue: 0.584),
        Color(red: 0.996, green: 0.498, blue: 0.639),
    ]
}

// MARK: - Gradient helpers
extension LinearGradient {
    static let appBackground = LinearGradient(
        colors: [.appBackgroundDeep, .appBackground],
        startPoint: .top,
        endPoint: .bottom
    )
}
