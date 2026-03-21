import SwiftUI

struct CreateEventView: View {
    @StateObject private var viewModel: CreateEventViewModel
    @Environment(\.dismiss) private var dismiss
    let onCreated: (EventSuggestion) -> Void
    @State private var dateText: String = ""

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
                    Text("Create a Plan")
                        .font(AppFont.title1())
                        .foregroundStyle(Color.textOnBlue)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, Spacing.md)

                    // MARK: White card
                    VStack(alignment: .leading, spacing: Spacing.lg) {

                        // Section 1 — Plan name (required)
                        formSection(heading: "What's the move?", tag: "Required") {
                            styledTextField("Game night, brunch, etc.", text: $viewModel.title)
                        }

                        // Section 2 — Location (optional)
                        formSection(icon: "mappin.and.ellipse", heading: "Addy?", tag: "Optional") {
                            styledTextField("Where are we meeting?", text: $viewModel.location)
                        }

                        // Section 3 — Date (optional)
                        formSection(icon: "calendar", heading: "When?", tag: "Optional") {
                            styledTextField("MM/DD/YYYY", text: $dateText)
                                #if os(iOS)
                                .keyboardType(.numbersAndPunctuation)
                                #endif
                                .onChange(of: dateText) { _, newValue in
                                    parseDateInput(newValue)
                                }
                        }

                        // Section 4 — Details (optional)
                        formSection(heading: "Details", tag: "Optional") {
                            TextField(
                                "Add any extra info...",
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
                            if viewModel.isSubmitting {
                                HStack(spacing: Spacing.sm) {
                                    ProgressView().tint(.white)
                                    Text("Creating…")
                                        .font(AppFont.headline())
                                        .foregroundStyle(.white)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, Spacing.md)
                            } else {
                                Text("Who's Down?")
                                    .font(AppFont.headline())
                                    .foregroundStyle(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, Spacing.md)
                            }
                        }
                        .background(Color(red: 0.38, green: 0.44, blue: 0.55))
                        .clipShape(RoundedRectangle(cornerRadius: Radius.xl))
                        .disabled(!viewModel.canSubmit || viewModel.isSubmitting)
                        .opacity(viewModel.canSubmit ? 1.0 : 0.5)
                        .padding(.top, Spacing.sm)
                    }
                    .padding(Spacing.lg)
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

    @ViewBuilder
    private func formSection<Content: View>(
        icon: String? = nil,
        heading: String,
        tag: String? = nil,
        @ViewBuilder content: () -> Content
    ) -> some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            HStack(spacing: 4) {
                if let icon {
                    Image(systemName: icon)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundStyle(Color.textSecondary)
                }
                Text(heading.uppercased())
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(Color.textSecondary)
                    .kerning(0.5)
                if let tag {
                    Text("(\(tag))")
                        .font(.system(size: 11, weight: .regular))
                        .foregroundStyle(Color.textTertiary)
                }
            }
            content()
        }
    }

    private func styledTextField(_ placeholder: String, text: Binding<String>) -> some View {
        TextField(placeholder, text: text)
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

    private func parseDateInput(_ text: String) {
        let formatter = DateFormatter()
        formatter.dateFormat = "MM/dd/yyyy"
        if let date = formatter.date(from: text) {
            viewModel.timeOptions[0].date = date
        }
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
