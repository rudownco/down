import Foundation
import Supabase

let supabase = SupabaseClient(
    supabaseURL: URL(string: "https://odtjglrjxgkphieqqrhb.supabase.co")!,
    supabaseKey: "sb_publishable_L_wtNCZrNtUl9XzKeaqIFA_q3_2xCwq",
    options: .init(
        auth: .init(emitLocalSessionAsInitialSession: true)
    )
)
