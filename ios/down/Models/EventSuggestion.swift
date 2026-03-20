import Foundation

enum EventStatus: String, Codable {
    case voting    = "voting"
    case confirmed = "confirmed"
    case pending   = "pending"

    var label: String {
        switch self {
        case .voting:    return "Voting"
        case .confirmed: return "Confirmed"
        case .pending:   return "Pending"
        }
    }

    var emoji: String {
        switch self {
        case .voting:    return "🗳️"
        case .confirmed: return "✅"
        case .pending:   return "⏳"
        }
    }
}

struct EventSuggestion: Identifiable, Hashable {
    let id: String
    var title: String
    var description: String?
    var location: String?
    var date: String?        // e.g. "Friday, Mar 21"
    var time: String?        // e.g. "7:00 PM"
    var status: EventStatus
    var attendees: [User]
    let suggestedBy: User
    var votingOptions: [VotingOption]
    var rsvps: [RSVP]

    init(
        id: String = UUID().uuidString,
        title: String,
        description: String? = nil,
        location: String? = nil,
        date: String? = nil,
        time: String? = nil,
        status: EventStatus = .pending,
        attendees: [User] = [],
        suggestedBy: User,
        votingOptions: [VotingOption] = [],
        rsvps: [RSVP] = []
    ) {
        self.id            = id
        self.title         = title
        self.description   = description
        self.location      = location
        self.date          = date
        self.time          = time
        self.status        = status
        self.attendees     = attendees
        self.suggestedBy   = suggestedBy
        self.votingOptions = votingOptions
        self.rsvps         = rsvps
    }

    // MARK: Derived

    /// Emoji badge determined by keywords in the title
    var emoji: String {
        let t = title.lowercased()
        if t.contains("pizza") || t.contains("dinner") || t.contains("lunch") || t.contains("food") { return "🍕" }
        if t.contains("movie") || t.contains("film") || t.contains("cinema")  { return "🎬" }
        if t.contains("game")  || t.contains("gaming")                         { return "🎮" }
        if t.contains("coffee") || t.contains("cafe") || t.contains("brunch")  { return "☕" }
        if t.contains("music") || t.contains("concert") || t.contains("band")  { return "🎸" }
        if t.contains("hike")  || t.contains("hiking") || t.contains("trail")  { return "🏔️" }
        if t.contains("beach") || t.contains("surf")                           { return "🏄" }
        if t.contains("bar")   || t.contains("drink") || t.contains("cocktail"){ return "🍹" }
        if t.contains("sport") || t.contains("basket") || t.contains("footbal"){ return "🏀" }
        return "🎉"
    }

    var totalVoters: Int { votingOptions.flatMap(\.voters).map(\.id).uniqued().count }

    var maxVotes: Int { votingOptions.map(\.votes).max() ?? 0 }

    func rsvpUsers(for status: RSVPStatus, in users: [User]) -> [User] {
        let ids = Set(rsvps.filter { $0.status == status }.map(\.userId))
        return users.filter { ids.contains($0.id) }
    }

    func hash(into hasher: inout Hasher) { hasher.combine(id) }
    static func == (lhs: EventSuggestion, rhs: EventSuggestion) -> Bool { lhs.id == rhs.id }
}

// MARK: - Sequence helper
private extension Array where Element: Hashable {
    func uniqued() -> [Element] {
        var seen = Set<Element>()
        return filter { seen.insert($0).inserted }
    }
}
