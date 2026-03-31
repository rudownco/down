import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Basic CORS (optional but helpful for browser clients)
  if (req.headers.get("Origin")) {
    // No preflight handling here; add OPTIONS if your client requires it.
  }

  let body: { token?: string } = {};
  try {
    body = await req.json();
  } catch {
    // ignore
  }

  const token = body.token;
  if (!token || typeof token !== "string") {
    return new Response(JSON.stringify({ error: "Missing token" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );

  // Use the caller's Authorization header so RLS remains meaningful where relevant.
  const supabaseUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );

  const {
    data: { user },
    error: userErr,
  } = await supabaseUser.auth.getUser();

  if (userErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = user.id;

  const { data: invite, error: inviteErr } = await supabaseAdmin
    .from("group_invite_tokens")
    .select("token, group_id, expires_at, used_at, used_by")
    .eq("token", token)
    .maybeSingle();

  if (inviteErr || !invite) {
    return new Response(JSON.stringify({ error: "Invalid invite token" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Expiry check
  if (invite.expires_at) {
    const expMs = new Date(invite.expires_at).getTime();
    if (Date.now() > expMs) {
      return new Response(JSON.stringify({ error: "Invite expired" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Idempotency A: if already used by SAME user => success
  if (invite.used_at) {
    if (invite.used_by !== userId) {
      return new Response(
        JSON.stringify({ error: "Invite already used by another user" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    // else continue
  }

  // Upsert membership (PK is (group_id, user_id))
  await supabaseAdmin.from("group_users").upsert(
    {
      group_id: invite.group_id,
      user_id: userId,
      role: "invitee",
      joined_at: new Date().toISOString(),
    },
    { onConflict: "group_id,user_id" }
  );

  // Mark used only if not already used
  if (!invite.used_at) {
    await supabaseAdmin
      .from("group_invite_tokens")
      .update({
        used_at: new Date().toISOString(),
        used_by: userId,
      })
      .eq("token", token);
  }

  return new Response(
    JSON.stringify({ ok: true, group_id: invite.group_id }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
