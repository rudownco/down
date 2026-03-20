import Foundation

// MARK: - Navigation Route Enum
// Used with NavigationStack's navigationDestination(for:) API
enum AppRoute: Hashable {
    case groupDetail(DownGroup)
    case createEvent(DownGroup)
    case voting(EventSuggestion, DownGroup)
    case rsvp(EventSuggestion, DownGroup)

    // Manual Hashable conformance since associated values need it
    func hash(into hasher: inout Hasher) {
        switch self {
        case .groupDetail(let g):      hasher.combine(0); hasher.combine(g.id)
        case .createEvent(let g):      hasher.combine(1); hasher.combine(g.id)
        case .voting(let e, let g):    hasher.combine(2); hasher.combine(e.id); hasher.combine(g.id)
        case .rsvp(let e, let g):      hasher.combine(3); hasher.combine(e.id); hasher.combine(g.id)
        }
    }

    static func == (lhs: AppRoute, rhs: AppRoute) -> Bool {
        lhs.hashValue == rhs.hashValue
    }
}
