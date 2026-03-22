import SwiftUI

// MARK: - Create Group Sheet
// Presented modally from the GroupDashboard FAB.
struct CreateGroupView: View {
    @Environment(\.dismiss) private var dismiss
    let currentUser: User
    let onCreated: (DownGroup) -> Void

    @State private var groupName  = ""
    @State private var isCreating = false
    @State private var error: String?

    private let service: DownServiceProtocol = SupabaseService()

    private var canCreate: Bool {
        !groupName.trimmingCharacters(in: .whitespaces).isEmpty
    }

    var body: some View {
        ZStack {
            LinearGradient.appBackground.ignoresSafeArea()

            VStack(spacing: 0) {
                NavHeader(title: "New Crew", onBack: { dismiss() })

                ScrollView(showsIndicators: false) {
                    VStack(spacing: Spacing.xl) {

                        // Hero
                        VStack(spacing: Spacing.sm) {
                            Text("👥")
                                .font(.system(size: 56))
                            Text("Start a new crew")
                                .font(AppFont.title2())
                                .foregroundStyle(Color.textOnBlue)
                            Text("Give your group a name and start planning together.")
                                .font(AppFont.callout())
                                .foregroundStyle(Color.textOnBlueMuted)
                                .multilineTextAlignment(.center)
                        }
                        .padding(.top, Spacing.xl)
                        .padding(.horizontal, Spacing.lg)

                        // Name input card
                        VStack(alignment: .leading, spacing: Spacing.sm) {
                            HStack(spacing: Spacing.sm) {
                                ZStack {
                                    Circle()
                                        .fill(Color.accentBlueMuted)
                                        .frame(width: 36, height: 36)
                                    Image(systemName: "person.2.fill")
                                        .font(.system(size: 15, weight: .medium))
                                        .foregroundStyle(Color.accentBlue)
                                }
                                Text("What's the crew called?")
                                    .font(AppFont.headline())
                                    .foregroundStyle(Color.textPrimary)
                            }

                            TextField(
                                "Friday Squad, Work Buds, Weekend Warriors…",
                                text: $groupName
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
                        .padding(Spacing.lg)
                        .background(Color.cardBackground)
                        .clipShape(RoundedRectangle(cornerRadius: Radius.xxl))
                        .shadow(color: Color.black.opacity(0.12), radius: 20, x: 0, y: 8)
                        .padding(.horizontal, Spacing.md)

                        // Create button
                        Button { handleCreate() } label: {
                            Group {
                                if isCreating {
                                    HStack(spacing: Spacing.sm) {
                                        ProgressView().tint(Color.textOnBlue)
                                        Text("Creating…")
                                    }
                                } else {
                                    Text("🚀  Create Crew")
                                }
                            }
                        }
                        .appButtonStyle(.primary)
                        .disabled(!canCreate || isCreating)
                        .opacity(canCreate ? 1.0 : 0.5)
                        .padding(.horizontal, Spacing.md)
                        .padding(.bottom, Spacing.xxxl)
                    }
                    .padding(.top, Spacing.md)
                }
            }
        }
        #if os(iOS)
        .toolbar(.hidden, for: .navigationBar)
        #endif
        .alert("Something went wrong", isPresented: .constant(error != nil)) {
            Button("OK") { error = nil }
        } message: {
            Text(error ?? "")
        }
    }

    // MARK: Create action
    private func handleCreate() {
        guard canCreate else { return }
        isCreating = true
        error = nil
        Task {
            do {
                let newGroup = try await service.createGroup(name: groupName.trimmingCharacters(in: .whitespaces))
                onCreated(newGroup)
                dismiss()
            } catch {
                self.error = error.localizedDescription
                isCreating = false
            }
        }
    }
}

// MARK: - Preview
#Preview {
    CreateGroupView(currentUser: MockUsers.currentUser, onCreated: { _ in })
}
