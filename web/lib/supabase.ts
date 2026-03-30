import { createSupabaseClient } from '@down/common';

// Web client — no storage override, defaults to browser localStorage
export const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
