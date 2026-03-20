# Down

A group event planning iOS app built with SwiftUI. Plan less. Vibe more.

## Requirements

- iOS 17.0 or later
- Xcode 15+

## Getting Started

1. Create a new **iOS App** project in Xcode (SwiftUI lifecycle, iOS 17+)
2. Delete the default `ContentView.swift`
3. Add all source folders as groups in the Xcode project navigator:
   - `App/`, `DesignSystem/`, `Models/`, `Services/`, `MockData/`, `ViewModels/`, `Components/`, `Screens/`
4. Build & run — all screens work immediately with mock data

## Project Structure

```
Down/
├── App/
│   ├── DownApp.swift           # @main entry point
│   ├── RootView.swift          # Auth gate + NavigationStack
│   └── AppRoute.swift          # Enum-based navigation routes
├── DesignSystem/
│   ├── AppColors.swift
│   ├── AppTypography.swift
│   ├── AppSpacing.swift
│   └── Styles/
│       ├── AppButtonStyle.swift
│       └── AppCardModifier.swift
├── Models/
│   ├── User.swift
│   ├── Group.swift             # DownGroup
│   ├── EventSuggestion.swift
│   ├── Vote.swift
│   └── RSVP.swift
├── Services/
│   └── MockDataService.swift   # DownServiceProtocol + MockDownService
├── MockData/
│   └── MockData.swift
├── ViewModels/
│   ├── LoginViewModel.swift
│   ├── GroupDashboardViewModel.swift
│   ├── GroupDetailViewModel.swift
│   ├── CreateEventViewModel.swift
│   ├── VotingViewModel.swift
│   └── RSVPViewModel.swift
├── Components/
│   ├── AvatarLogo.swift
│   ├── AvatarStack.swift
│   ├── NavHeader.swift
│   ├── GroupListItem.swift
│   ├── EventCard.swift
│   ├── VoteList.swift
│   └── RSVPSelector.swift
├── Screens/
│   ├── LoginView.swift
│   ├── GroupDashboardView.swift
│   ├── GroupDetailView.swift
│   ├── CreateEventView.swift
│   ├── VotingView.swift
│   └── RSVPView.swift
└── README.md
```

## Architecture

- **SwiftUI** (iOS 17+) with **MVVM**
- `NavigationStack` + `AppRoute` enum for type-safe navigation
- `DownServiceProtocol` — swap mock for real API with zero screen changes
- `@MainActor` ViewModels for thread-safe UI updates

## License

MIT
