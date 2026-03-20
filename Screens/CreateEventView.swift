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

            VStack(spacing: 0) {
                NavHeader(title: "Suggest Event", onBack: { dismiss() })

                ScrollView(showsIndicators: false) {
                    VStack(spacing: Spacing.lg) {
                        formCard
                        timeOptionsSection
                        submitButton
                    }
                    .padding(.horizontal, Spacing.md)
                    .padding(.vertical, Spacing.md)
                    .padding(.bottom, Spacing.xxxl)
                }
            }
        }
        #if os(iOS)
        .toolbar(.hidden, for: .navigationBar)
        #endif
    }

    // MARK: Main form card
    private var formCard: some View {
        VStack(spacing: 0) {
            labeledField(emoji: "🎉", placeholder: "What are we doing?", text: $viewModel.title)

            Divider().background(Color.divider).padding(.leading, 44)

            labeledField(emoji: "📍", placeholder: "Where? (optional)", text: $viewModel.location)

            Divider().background(Color.divider).padding(.leading, 44)

            VStack(alignment: .leading, spacing: Spacing.xxs) {
                HStack(alignment: .top, spacing: Spacing.sm) {
                    Text("✏️").font(.system(size: 20)).frame(width: 24)
                    TextField("Description (optional)", text: $viewModel.description, axis: .vertical)
                        .font(AppFont.body())
                        .foregroundStyle(Color.textPrimary)
                        .lineLimit(3...6)
                }
                .padding(.horizontal, Spacing.md)
                .padding(.vertical, Spacing.sm)
            }
        }
        .appCard(padding: 0, cornerRadius: Radius.xxl)
    }

    private func labeledField(emoji: String, placeholder: String, text: Binding<String>) -> some View {
        HStack(spacing: Spacing.sm) {
            Text(emoji).font(.system(size: 20)).frame(width: 24)
            TextField(placeholder, text: text)
                .font(AppFont.body())
                .foregroundStyle(Color.textPrimary)
        }
        .padding(.horizontal, Spacing.md)
        .padding(.vertical, Spacing.sm + 2)
    }

    // MARK: Time options section
    private var timeOptionsSection: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            HStack {
                Text("📅 When?")
                    .font(AppFont.headline())
                    .foregroundStyle(Color.textOnBlue)
                Text("(add a few options)")
                    .font(AppFont.callout())
                    .foregroundStyle(Color.textOnBlueMuted)
            }

            VStack(spacing: Spacing.md) {
                ForEach($viewModel.timeOptions) { $option in
                    TimeOptionRow(option: $option, canRemove: viewModel.timeOptions.count > 1) {
                        viewModel.removeTimeOption(id: option.id)
                    }
                }
            }

            // Add another time button
            Button {
                viewModel.addTimeOption()
            } label: {
                HStack(spacing: Spacing.xs) {
                    Image(systemName: "plus.circle.fill")
                    Text("Add another time")
                }
                .font(AppFont.subhead())
                .foregroundStyle(Color.textOnBlue)
                .frame(maxWidth: .infinity)
                .padding(.vertical, Spacing.sm)
                .background(Color.overlayPanel)
                .clipShape(RoundedRectangle(cornerRadius: Radius.xl))
            }
        }
    }

    // MARK: Submit button
    private var submitButton: some View {
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
                        ProgressView().tint(.appBackground)
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
        .padding(.horizontal, Spacing.md)
    }
}

// MARK: - Time Option Row
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
            // Header with selected date summary + remove button
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

            // Calendar
            DatePicker("", selection: $option.date, displayedComponents: .date)
                .datePickerStyle(.graphical)
                .labelsHidden()
                .tint(Color.accentBlue)
                .padding(.horizontal, Spacing.xs)

            Divider()
                .background(Color.divider)
                .padding(.horizontal, Spacing.md)

            // Time row
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
        .background(Color.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Radius.xxl))
        .shadow(color: Color.black.opacity(0.08), radius: 12, x: 0, y: 4)
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
