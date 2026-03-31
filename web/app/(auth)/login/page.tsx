'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { inviteToken } from '@/lib/inviteToken';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';

// Separated so useSearchParams() is inside a Suspense boundary (Next.js requirement)
function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { session } = useAuth();

  // Already logged in — bounce to intended destination or dashboard
  useEffect(() => {
    if (session) {
      const next = searchParams.get('redirect') ?? '/dashboard';
      router.replace(next);
    }
  }, [session, searchParams, router]);

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);

    // Preserve redirect destination across the OAuth round-trip.
    // All OAuth callbacks land at /auth/callback which then redirects to `next`.
    // Priority: ?redirect= URL param → pending invite token in sessionStorage → /dashboard
    const redirectParam = searchParams.get('redirect');
    const pendingToken = inviteToken.get();
    const next =
      redirectParam
        ? redirectParam
        : pendingToken
          ? `/invite/${pendingToken}`
          : '/dashboard';

    const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <>
      <div className="w-full max-w-sm flex flex-col gap-3">
        <Button
          variant="surface"
          size="lg"
          className="w-full gap-3"
          onClick={signInWithGoogle}
          disabled={loading}
        >
          <span className="font-bold text-base">G</span>
          {loading ? 'Signing you in…' : 'Continue with Google'}
        </Button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-error text-center max-w-sm">{error}</p>
      )}
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="text-center mb-12">
        <p className="text-on-surface-variant text-xl font-heading mb-1">r u</p>
        <h1 className="text-6xl font-heading font-black text-primary tracking-tight">
          down?
        </h1>
        <p className="text-3xl mt-2">👇</p>
        <p className="text-on-surface-variant text-sm font-body italic mt-4">
          time to assemble the dream team.
        </p>
      </div>

      <Suspense fallback={
        <div className="w-full max-w-sm">
          <div className="h-14 bg-surface-container rounded-2xl animate-pulse" />
        </div>
      }>
        <LoginForm />
      </Suspense>

      <p className="mt-8 text-xs text-outline text-center max-w-xs">
        By continuing you agree to our Terms &amp; Privacy Policy
      </p>
    </div>
  );
}
