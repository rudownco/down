'use client';

import { AvatarCircle } from '@down/common';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';

export default function ProfilePage() {
  const { user, signOut } = useAuth();

  if (!user) return null; // auth guard in layout handles redirect

  const currentUser = {
    id: user.id,
    name: user.user_metadata?.full_name ?? user.email ?? 'You',
    avatarUrl: user.user_metadata?.avatar_url,
  };

  const handle = currentUser.name.toLowerCase().replace(/\s+/g, '');

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <AvatarCircle user={currentUser} size="xl" />
      <div className="text-center">
        <h1 className="text-2xl font-heading font-bold text-on-surface">{currentUser.name}</h1>
        <p className="text-sm text-outline mt-1">@{handle}</p>
      </div>

      <Button variant="outline" size="lg" className="w-full max-w-xs" onClick={signOut}>
        Sign Out
      </Button>
    </div>
  );
}
