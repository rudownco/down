import SwiftUI

@main
struct DownApp: App {
    var body: some Scene {
        WindowGroup {
            RootView()
                .preferredColorScheme(.light) // Design is light-on-blue; disable dark mode auto-flip
        }
    }
}
