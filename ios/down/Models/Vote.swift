import Foundation

struct VotingOption: Identifiable, Hashable {
    let id: String
    let date: String    // e.g. "Friday, Mar 21"
    let time: String    // e.g. "7:00 PM"
    var votes: Int
    var voters: [User]

    init(
        id: String = UUID().uuidString,
        date: String,
        time: String,
        votes: Int = 0,
        voters: [User] = []
    ) {
        self.id     = id
        self.date   = date
        self.time   = time
        self.votes  = votes
        self.voters = voters
    }

    func hash(into hasher: inout Hasher) { hasher.combine(id) }
    static func == (lhs: VotingOption, rhs: VotingOption) -> Bool { lhs.id == rhs.id }
}

struct Vote: Identifiable {
    let id: String
    let userId: String
    let eventId: String
    let votingOptionId: String
    let createdAt: Date

    init(
        id: String = UUID().uuidString,
        userId: String,
        eventId: String,
        votingOptionId: String
    ) {
        self.id            = id
        self.userId        = userId
        self.eventId       = eventId
        self.votingOptionId = votingOptionId
        self.createdAt     = Date()
    }
}
