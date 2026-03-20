// swift-tools-version: 5.9
// NOTE: This package manifest exists for repo tooling.
// The app is an iOS Xcode project — create Down.xcodeproj and add the
// source folders (App, DesignSystem, Components, Screens, etc.) as groups.
import PackageDescription

let package = Package(
    name: "Down",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .library(name: "Down", targets: ["Down"])
    ],
    targets: [
        .target(
            name: "Down",
            path: ".",
            exclude: [
                "App/DownApp.swift", // Entry point requires Xcode project
                "Package.swift",
                "README.md",
                ".build"
            ],
            sources: [
                "App/AppRoute.swift",
                "App/RootView.swift",
                "Components",
                "DesignSystem",
                "MockData",
                "Models",
                "Screens",
                "Services",
                "ViewModels"
            ],
            resources: [
                .process("Resources/Assets.xcassets")
            ]
        )
    ]
)
