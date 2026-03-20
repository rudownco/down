import Foundation

enum RSVPStatus: String, CaseIterable, Codable {
    case going    = "going"
    case maybe    = "maybe"
    case notGoing = "not_going"

    var label: String {
        switch self {
        case .going:    return "Going"
        case .maybe:    return "Maybe"
        case .notGoing: return "Can't"
        }
    }

    var emoji: String {
        switch self {
        case .going:    return "🙌"
        case .maybe:    return "🤔"
        case .notGoing: return "😢"
        }
    }
}

struct RSVP: Identifiable {
    let id: String
    let userId: String
    let eventId: String
    var status: RSVPStatus
    let updatedAt: Date

    init(
        id: String = UUID().uuidString,
        userId: String,
        eventId: String,
        status: RSVPStatus
    ) {
        self.id        = id
        self.userId    = userId
        self.eventId   = eventId
        self.status    = status
        self.updatedAt = Date()
    }
}
