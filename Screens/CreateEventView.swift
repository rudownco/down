import SwiftUI

struct CreateEventView: View {
    @StateObject private var viewModel: CreateEventViewModel
    @Environment(\.dismiss) private var dismiss
    let onCreated: (EventSuggestion) -> Void

    init(group: DownGroup, currentUser: User, onCreated: @escaping (EventSuggestion) -> Void) {
        _viewModel = StateObject(wrappedValue: CreateEventViewModel(group: group, currentUser: currentUser))
        self.onCreated = onCreated
    }

    var body: some View {
        ZStack {
            LinearGradient.appBackground.ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: Spacing.xl) {

                    // MARK: Back button row
                    HStack {
                        Button { dismiss() } label: {
                            Image(systemName: "chevron.left")
                                .font(.system(size: 17, weight: .semibold))
                                .foregroundStyle(Color.textOnBlue)
                        }
                        Spacer()
                    }
                    .padding(.horizontal, Spacing.md)

                    // MARK: Page header
                    Text("Suggest Event")
                        .font(AppFont.title1())
                        .foregroundStyle(Color.textOnBlue)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, Spacing.md)

                    // MARK: White card
                    VStack(spacing: 0) {

                        // Section 1 — Event name
                        formSection(icon: "sparkles", heading: "What's the plan?") {
                            TextField(
                                "Movie night, brunch, hike…",
                                text: $viewModel.title
                            )
                            .font(AppFont.body())
                            .foregroundStyle(Color.textPrimary)
                            .padding(.horizontal, Spacing.md)
                            .padding(.vertical, Spacing.sm + 2)
                            .background(Color.inputBackground)
                            .clipShape(RoundedRectangle(cornerRadius: Radius.lg))
                            .overlay(
                                RoundedRectangle(cornerRadius: Radius.lg)
                                    .stroke(Color.inputBorder, lineWidth: 1)
                            )
                        }

                        cardDivider

                        // Section 2 — Location
                        formSection(icon: "mappin.and.ellipse", heading: "Where at?", isOptional: true) {
                            TextField(
                                "Your place, the park, TBD…",
                                text: $viewModel.location
                            )
                            .font(AppFont.body())
                            .foregroundStyle(Color.textPrimary)
                            .padding(.horizontal, Spacing.md)
                            .padding(.vertical, Spacing.sm + 2)
                            .background(Color.inputBackground)
                            .clipShape(RoundedRectangle(cornerRadius: Radius.lg))
                            .overlay(
                                RoundedRectangle(cornerRadius: Radius.lg)
                                    .stroke(Color.inputBorder, lineWidth: 1)
                            )
                        }

                        cardDivider

                        // Section 3 — When (time options)
                        formSection(icon: "calendar", heading: "When?", subLabel: "add a few options") {
                            VStack(spacing: Spacing.md) {
                                ForEach($viewModel.timeOptions) { $option in
                                    TimeOptionRow(
                                        option: $option,
                                        canRemove: viewModel.timeOptions.count > 1
                                    ) {
                                        viewModel.removeTimeOption(id: option.id)
                                    }
                                }

                                Button { viewModel.addTimeOption() } label: {
                                    HStack(spacing: Spacing.xs) {
                                        Image(systemName: "plus.circle.fill")
                                        Text("Add another time")
                                    }
                                    .font(AppFont.subhead())
                                    .foregroundStyle(Color.accentBlue)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, Spacing.sm)
                                    .background(Color.accentBlueMuted)
                                    .clipShape(RoundedRectangle(cornerRadius: Radius.xl))
                                }
                            }
                        }

                        cardDivider

                        // Section 4 — Extra details
                        formSection(icon: "info.circle", heading: "Any deets?", isOptional: true) {
                            TextField(
                                "Extra info, links, vibes…",
                                text: $viewModel.description,
                                axis: .vertical
                            )
                            .font(AppFont.body())
                            .foregroundStyle(Color.textPrimary)
                            .lineLimit(3...6)
                            .padding(.horizontal, Spacing.md)
                            .padding(.vertical, Spacing.sm + 2)
                            .background(Color.inputBackground)
                            .clipShape(RoundedRectangle(cornerRadius: Radius.lg))
                            .overlay(
                                RoundedRectangle(cornerRadius: Radius.lg)
                                    .stroke(Color.inputBorder, lineWidth: 1)
                            )
                        }

                        // MARK: Submit button
                        Button {
                            Task {
                                if let event = await viewModel.submit() {
                                    onCreated(event)
                                    dismiss()
                                }
                            }
                        } label: {
                            Group {
                                if viewModel.isSubmitting {
                                    HStack(spacing: Spacing.sm) {
                                        ProgressView().tint(Color.textOnBlue)
                                        Text("Creating…")
                                    }
                                } else {
                                    Text("🚀  Suggest It!")
                                }
                            }
                        }
                        .appButtonStyle(.primary)
                        .disabled(!viewModel.canSubmit || viewModel.isSubmitting)
                        .opacity(viewModel.canSubmit ? 1.0 : 0.5)
                        .padding(.top, Spacing.xs)
                        .padding([.horizontal, .bottom], Spacing.lg)
                    }
                    .background(Color.cardBackground)
                    .clipShape(RoundedRectangle(cornerRadius: Radius.xxl))
                    .shadow(color: Color.black.opacity(0.12), radius: 20, x: 0, y: 8)
                    .padding(.horizontal, Spacing.md)
                    .padding(.bottom, Spacing.xxxl)
                }
                .padding(.top, Spacing.md)
            }
        }
        #if os(iOS)
        .toolbar(.hidden, for: .navigationBar)
        #endif
    }

    // MARK: Helpers

    private var cardDivider: some View {
        Divider()
            .background(Color.divider)
            .padding(.horizontal, Spacing.lg)
    }

    @ViewBuilder
    private func formSection<Content: View>(
        icon: String,
        heading: String,
        isOptional: Bool = false,
        subLabel: String? = nil,
        @ViewBuilder content: () -> Content
    ) -> some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            HStack(spacing: Spacing.sm) {
                ZStack {
                    Circle()
                        .fill(Color.accentBlueMuted)
                        .frame(width: 36, height: 36)
                    Image(systemName: icon)
                        .font(.system(size: 15, weight: .medium))
                        .foregroundStyle(Color.accentBlue)
                }
                Text(heading)
                    .font(AppFont.headline())
                    .foregroundStyle(Color.textPrimary)
                if isOptional {
                    Text("(optional)")
                        .font(AppFont.caption())
                        .foregroundStyle(Color.textTertiary)
                }
                if let subLabel {
                    Text("(\(subLabel))")
                        .font(AppFont.caption())
                        .foregroundStyle(Color.textTertiary)
                }
            }

            content()
        }
        .padding(.horizontal, Spacing.lg)
        .padding(.vertical, Spacing.lg)
    }
}

// MARK: - Time Option Row (unchanged)
private struct TimeOptionRow: View {
    @Binding var option: TimeOptionInput
    let canRemove: Bool
    let onRemove: () -> Void

    private var selectedDayFormatted: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE, MMM d"
        return formatter.string(from: option.date)
    }

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Text(selectedDayFormatted)
                    .font(AppFont.subhead())
                    .foregroundStyle(Color.accentBlue)

                Spacer()

                if canRemove {
                    Button(action: onRemove) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 20))
                            .foregroundStyle(Color.textTertiary)
                    }
                }
            }
            .padding(.horizontal, Spacing.md)
            .padding(.top, Spacing.md)
            .padding(.bottom, Spacing.xs)

            DatePicker("", selection: $option.date, displayedComponents: .date)
                .datePickerStyle(.graphical)
                .labelsHidden()
                .tint(Color.accentBlue)
                .padding(.horizontal, Spacing.xs)

            Divider()
                .background(Color.divider)
                .padding(.horizontal, Spacing.md)

            HStack(spacing: Spacing.sm) {
                Image(systemName: "clock.fill")
                    .font(.system(size: 16))
                    .foregroundStyle(Color.accentBlue)

                Text("Time")
                    .font(AppFont.subhead())
                    .foregroundStyle(Color.textSecondary)

                Spacer()

                DatePicker("", selection: $option.time, displayedComponents: .hourAndMinute)
                    .datePickerStyle(.compact)
                    .labelsHidden()
                    .tint(Color.accentBlue)
            }
            .padding(.horizontal, Spacing.md)
            .padding(.vertical, Spacing.sm)
        }
        .background(Color.cardBackgroundSecondary)
        .clipShape(RoundedRectangle(cornerRadius: Radius.xl))
        .overlay(
            RoundedRectangle(cornerRadius: Radius.xl)
                .stroke(Color.inputBorder, lineWidth: 1)
        )
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        CreateEventView(
            group: MockGroups.fridaySquad,
            currentUser: MockUsers.currentUser,
            onCreated: { _ in }
        )
    }
}
