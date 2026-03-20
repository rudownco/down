import SwiftUI

// MARK: - Single RSVP Option Button
private struct RSVPOptionButton: View {
    let status: RSVPStatus
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: Spacing.xs) {
                Text(status.emoji)
                    .font(.system(size: 32))
                Text(status.label)
                    .font(AppFont.subhead())
                    .foregroundStyle(isSelected ? .accentBlue : .textPrimary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, Spacing.md)
            .background(isSelected ? Color.accentBlueMuted : Color.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: Radius.xl))
            .overlay(
                RoundedRectangle(cornerRadius: Radius.xl)
                    .strokeBorder(
                        isSelected ? Color.accentBlue : Color.divider,
                        lineWidth: isSelected ? 2 : 1
                    )
            )
            .scaleEffect(isSelected ? 1.03 : 1.0)
            .animation(.spring(duration: 0.25), value: isSelected)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - RSVP Selector Grid
struct RSVPSelector: View {
    @Binding var selectedStatus: RSVPStatus?

    var body: some View {
        HStack(spacing: Spacing.sm) {
            ForEach(RSVPStatus.allCases, id: \.rawValue) { status in
                RSVPOptionButton(
                    status: status,
                    isSelected: selectedStatus == status
                ) {
                    selectedStatus = (selectedStatus == status) ? nil : status
                }
            }
        }
    }
}

// MARK: - Preview
#Preview {
    @Previewable @State var selection: RSVPStatus? = .going

    VStack(spacing: Spacing.xl) {
        RSVPSelector(selectedStatus: $selection)
        Text("Selected: \(selection?.label ?? "none")")
            .foregroundStyle(.textOnBlue)
    }
    .padding()
    .background(LinearGradient.appBackground)
}
