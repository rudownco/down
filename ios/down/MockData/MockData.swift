import Foundation

// MARK: - Mock Users
enum MockUsers {
    static let alex   = User(id: "u1", name: "Alex Kim")
    static let jamie  = User(id: "u2", name: "Jamie Chen")
    static let taylor = User(id: "u3", name: "Taylor Rodriguez")
    static let morgan = User(id: "u4", name: "Morgan Lee")
    static let casey  = User(id: "u5", name: "Casey Park")
    static let river  = User(id: "u6", name: "River Stone")
    static let sam    = User(id: "u7", name: "Sam Walsh")

    static let currentUser = alex
    static let all: [User] = [alex, jamie, taylor, morgan, casey, river, sam]
}

// MARK: - Mock Voting Options
enum MockVotingOptions {
    static let pizzaOptions: [VotingOption] = [
        VotingOption(id: "vo1", date: "Friday, Mar 21",   time: "7:00 PM",  votes: 4, voters: [MockUsers.alex, MockUsers.jamie, MockUsers.taylor, MockUsers.morgan]),
        VotingOption(id: "vo2", date: "Saturday, Mar 22", time: "6:30 PM",  votes: 2, voters: [MockUsers.casey, MockUsers.river]),
        VotingOption(id: "vo3", date: "Sunday, Mar 23",   time: "5:00 PM",  votes: 1, voters: [MockUsers.sam]),
    ]

    static let movieOptions: [VotingOption] = [
        VotingOption(id: "vo4", date: "Saturday, Mar 22", time: "8:00 PM",  votes: 3, voters: [MockUsers.alex, MockUsers.jamie, MockUsers.casey]),
        VotingOption(id: "vo5", date: "Sunday, Mar 23",   time: "3:00 PM",  votes: 2, voters: [MockUsers.morgan, MockUsers.taylor]),
    ]
}

// MARK: - Mock Events
enum MockEvents {
    static let pizzaNight = EventSuggestion(
        id: "e1",
        title: "Pizza Night",
        description: "Let's hit that new wood-fired place downtown. They have 30+ toppings!",
        location: "Napoli's Pizza, 42 Main St",
        date: nil,
        time: nil,
        status: .voting,
        attendees: Array(MockUsers.all.prefix(5)),
        suggestedBy: MockUsers.jamie,
        votingOptions: MockVotingOptions.pizzaOptions
    )

    static let movieMarathon = EventSuggestion(
        id: "e2",
        title: "Movie Marathon",
        description: "Horror movie triple feature — if you dare 👻",
        location: "Taylor's place",
        date: "Saturday, Mar 22",
        time: "8:00 PM",
        status: .confirmed,
        attendees: Array(MockUsers.all.prefix(4)),
        suggestedBy: MockUsers.taylor,
        votingOptions: MockVotingOptions.movieOptions,
        rsvps: [
            RSVP(id: "r1", userId: "u1", eventId: "e2", status: .going),
            RSVP(id: "r2", userId: "u2", eventId: "e2", status: .going),
            RSVP(id: "r3", userId: "u3", eventId: "e2", status: .maybe),
            RSVP(id: "r4", userId: "u4", eventId: "e2", status: .notGoing),
            RSVP(id: "r5", userId: "u5", eventId: "e2", status: .going),
        ]
    )

    static let coffeeRun = EventSuggestion(
        id: "e3",
        title: "Sunday Coffee Run",
        description: "Brunch vibes, lazy Sunday energy ☀️",
        location: "Blue Bottle Coffee",
        date: nil,
        time: nil,
        status: .pending,
        attendees: [MockUsers.alex, MockUsers.casey],
        suggestedBy: MockUsers.casey
    )

    static let gamingSession = EventSuggestion(
        id: "e4",
        title: "Gaming Session",
        description: "Mario Kart tournament — loser buys pizza next time",
        location: "Morgan's place",
        date: "Friday, Mar 28",
        time: "9:00 PM",
        status: .confirmed,
        attendees: Array(MockUsers.all.prefix(6)),
        suggestedBy: MockUsers.morgan,
        rsvps: [
            RSVP(id: "r6",  userId: "u1", eventId: "e4", status: .going),
            RSVP(id: "r7",  userId: "u2", eventId: "e4", status: .going),
            RSVP(id: "r8",  userId: "u4", eventId: "e4", status: .going),
            RSVP(id: "r9",  userId: "u5", eventId: "e4", status: .maybe),
            RSVP(id: "r10", userId: "u6", eventId: "e4", status: .notGoing),
        ]
    )
}

// MARK: - Mock Groups
enum MockGroups {
    static let fridaySquad = DownGroup(
        id: "g1",
        name: "Friday Squad",
        members: Array(MockUsers.all.prefix(5)),
        lastActivity: "2h ago",
        unreadCount: 3
    )

    static let workBuds = DownGroup(
        id: "g2",
        name: "Work Buds",
        members: Array(MockUsers.all.prefix(4)),
        lastActivity: "1d ago",
        unreadCount: 0
    )

    static let weekendWarriors = DownGroup(
        id: "g3",
        name: "Weekend Warriors",
        members: MockUsers.all,
        lastActivity: "5m ago",
        unreadCount: 7
    )

    static let coffeeClub = DownGroup(
        id: "g4",
        name: "Coffee Club",
        members: [MockUsers.alex, MockUsers.casey, MockUsers.river],
        lastActivity: "3d ago",
        unreadCount: 0
    )

    static let all: [DownGroup] = [fridaySquad, weekendWarriors, workBuds, coffeeClub]
}

// MARK: - Mock Events per Group
extension DownGroup {
    var mockEvents: [EventSuggestion] {
        switch id {
        case "g1": return [MockEvents.pizzaNight, MockEvents.movieMarathon]
        case "g3": return [MockEvents.gamingSession, MockEvents.coffeeRun, MockEvents.pizzaNight]
        default:   return [MockEvents.coffeeRun]
        }
    }
}
