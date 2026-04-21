'use client';

import { useRef, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { AvatarCircle, uploadAvatar, updateProfile } from '@down/common';
import { useAuth } from '@/components/AuthProvider';
import { useTheme } from '@/components/ThemeProvider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const THEME_OPTIONS = [
  { key: 'light'  as const, label: 'Light',  Icon: Sun },
  { key: 'dark'   as const, label: 'Dark',   Icon: Moon },
  { key: 'system' as const, label: 'System', Icon: Monitor },
];

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const { mode, setMode } = useTheme();
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
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-8 py-12">
      {/* Avatar */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="relative group rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Change avatar"
      >
        <div className={isUploading ? 'opacity-60' : ''}>
          <AvatarCircle user={user} size="2xl" />
        </div>
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="text-white text-xs font-medium">change</span>
        </div>
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

      {/* Name */}
      <div className="text-center">
        <h1 className="text-2xl font-heading font-bold text-on-surface">{user.name}</h1>
        <p className="text-sm text-outline mt-1">@{handle}</p>
      </div>

      {/* Appearance card */}
      <div className="w-full max-w-xs bg-surface-container-low rounded-2xl p-5 flex flex-col gap-3 border border-outline-variant/30">
        <p className="font-heading font-semibold text-primary">appearance</p>
        <div className="flex gap-2">
          {THEME_OPTIONS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-colors ${
                mode === key
                  ? 'bg-primary-container text-on-primary-container'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <Icon size={16} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
