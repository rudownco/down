import SwiftUI

// MARK: - Typography Scale
// Uses .rounded design to keep the playful, casual feel
enum AppFont {
    static func largeTitle() -> Font { .system(size: 34, weight: .black,    design: .rounded) }
    static func title1()     -> Font { .system(size: 28, weight: .bold,     design: .rounded) }
    static func title2()     -> Font { .system(size: 22, weight: .bold,     design: .rounded) }
    static func title3()     -> Font { .system(size: 20, weight: .semibold, design: .rounded) }
    static func headline()   -> Font { .system(size: 17, weight: .semibold, design: .rounded) }
    static func body()       -> Font { .system(size: 16, weight: .regular,  design: .rounded) }
    static func callout()    -> Font { .system(size: 15, weight: .regular,  design: .rounded) }
    static func subhead()    -> Font { .system(size: 14, weight: .medium,   design: .rounded) }
    static func footnote()   -> Font { .system(size: 13, weight: .regular,  design: .rounded) }
    static func caption()    -> Font { .system(size: 12, weight: .regular,  design: .rounded) }
    static func caption2()   -> Font { .system(size: 11, weight: .medium,   design: .rounded) }
}

// MARK: - Convenience View modifier
struct AppTextStyle: ViewModifier {
    let font: Font
    let color: Color

    func body(content: Content) -> some View {
        content
            .font(font)
            .foregroundStyle(color)
    }
}

extension View {
    func appTextStyle(_ font: Font, color: Color = .textPrimary) -> some View {
        modifier(AppTextStyle(font: font, color: color))
    }
}
