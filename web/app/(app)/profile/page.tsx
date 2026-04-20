'use client';

import { useRef, useState } from 'react';
import { AvatarCircle, uploadAvatar, updateProfile } from '@down/common';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, signOut, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!user) return null;

  const handle = user.name.toLowerCase().replace(/\s+/g, '');

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const fileExt = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    setIsUploading(true);
    try {
      const publicUrl = await uploadAvatar(supabase, user.id, file, fileExt);
      await updateProfile(supabase, user.id, { avatar_url: publicUrl });
      await refreshProfile();
      toast.success('Avatar updated');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Could not update avatar');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8 max-w-sm mx-auto px-4">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="relative group rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Change avatar"
      >
        <div className={isUploading ? 'opacity-60' : ''}>
          <AvatarCircle user={user} size="xl" />
        </div>
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="text-white text-xs font-medium">change</span>
        </div>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />

      <div className="text-center">
        <h1 className="text-2xl font-heading font-bold text-on-surface">{user.name}</h1>
        <p className="text-sm text-outline mt-1">@{handle}</p>
      </div>

      <Button variant="outline" size="lg" className="w-full max-w-xs" onClick={signOut}>
        Sign Out
      </Button>
    </div>
  );
}
