import Foundation

struct DownGroup: Identifiable, Hashable {
    let id: String
    let name: String
    var members: [User]
    var lastActivity: String
    var unreadCount: Int

    private let _memberCount: Int?

    init(
        id: String = UUID().uuidString,
        name: String,
        members: [User] = [],
        memberCount: Int? = nil,
        lastActivity: String = "just now",
        unreadCount: Int = 0
    ) {
        self.id           = id
        self.name         = name
        self.members      = members
        self._memberCount = memberCount
        self.lastActivity = lastActivity
        self.unreadCount  = unreadCount
    }

    var emoji: String {
        let pool = ["🏄", "🎸", "🎮", "🍕", "☕", "🎬", "🏀", "🎭", "🌮", "🎯", "🎉", "🏔️"]
        let index = abs(name.hashValue) % pool.count
        return pool[index]
    }

    var memberCountLabel: String {
        let count = _memberCount ?? members.count
        return "\(count) member\(count == 1 ? "" : "s")"
    }

    func hash(into hasher: inout Hasher) { hasher.combine(id) }
    static func == (lhs: DownGroup, rhs: DownGroup) -> Bool { lhs.id == rhs.id }
}
