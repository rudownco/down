'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

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

      {/* Auth buttons */}
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

      <p className="mt-8 text-xs text-outline text-center max-w-xs">
        By continuing you agree to our Terms &amp; Privacy Policy
      </p>
    </div>
  );
}
