import SwiftUI

struct User: Identifiable, Hashable, Codable {
    let id: String
    let name: String

    init(id: String = UUID().uuidString, name: String) {
        self.id   = id
        self.name = name
    }

    // MARK: Derived display properties

    var initials: String {
        let parts = name.split(separator: " ")
        if parts.count >= 2 {
            return (String(parts[0].prefix(1)) + String(parts[1].prefix(1))).uppercased()
        }
        return String(name.prefix(2)).uppercased()
    }

    var avatarColor: Color {
        let index = abs(name.hashValue) % Color.avatarPalette.count
        return Color.avatarPalette[index]
    }
}
