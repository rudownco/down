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
        .navigationBarHidden(true)
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
                        .foregroundStyle(.textPrimary)
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
                .foregroundStyle(.textPrimary)
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
                    .foregroundStyle(.textOnBlue)
                Text("(add a few options)")
                    .font(AppFont.callout())
                    .foregroundStyle(.textOnBlueMuted)
            }

            VStack(spacing: Spacing.sm) {
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
                .foregroundStyle(.textOnBlue)
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

    var body: some View {
        HStack(spacing: Spacing.sm) {
            VStack(spacing: Spacing.xs) {
                DatePicker("", selection: $option.date, displayedComponents: .date)
                    .datePickerStyle(.compact)
                    .labelsHidden()
                    .frame(maxWidth: .infinity, alignment: .leading)

                DatePicker("", selection: $option.time, displayedComponents: .hourAndMinute)
                    .datePickerStyle(.compact)
                    .labelsHidden()
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(Spacing.sm)
            .background(Color.cardBackgroundSecondary)
            .clipShape(RoundedRectangle(cornerRadius: Radius.lg))
            .frame(maxWidth: .infinity)

            if canRemove {
                Button(action: onRemove) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 22))
                        .foregroundStyle(Color.textSecondary)
                }
            }
        }
        .appCard(padding: Spacing.sm, cornerRadius: Radius.xl)
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
