import Foundation

extension String {
    /// Parses an ISO8601 timestamp string and returns a relative label e.g. "2h ago", "just now".
    func relativeFormatted() -> String {
        let parser = ISO8601DateFormatter()
        parser.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        // Try with fractional seconds first, fall back without
        let date = parser.date(from: self) ?? {
            parser.formatOptions = [.withInternetDateTime]
            return parser.date(from: self)
        }()

        guard let date else { return self }

        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: date, relativeTo: .now)
    }
}
