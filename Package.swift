// swift-tools-version: 5.9
// NOTE: This package manifest exists for repo tooling.
// The app is an iOS Xcode project — create Down.xcodeproj and add the
// source folders (App, DesignSystem, Components, Screens, etc.) as groups.
import PackageDescription

let package = Package(
    name: "Down",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(name: "Down", targets: ["Down"])
    ],
    targets: [
        .target(
            name: "Down",
            path: "App",
            exclude: ["DownApp.swift"] // Entry point requires Xcode project
        )
    ]
)
