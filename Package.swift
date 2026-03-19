// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "Down",
    platforms: [
        .macOS(.v14)
    ],
    products: [
        .executable(name: "Down", targets: ["Down"])
    ],
    targets: [
        .executableTarget(
            name: "Down",
            path: "Sources/Down"
        )
    ]
)
