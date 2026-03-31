'use client';

import { useEffect, useState, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { GroupCard } from '@/components/GroupCard';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { fetchGroups, createGroup } from '@down/common';
import type { DownGroup } from '@down/common';
import { useAuth } from '@/components/AuthProvider';

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<DownGroup[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    fetchGroups(supabase).then(setGroups).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (showCreate) inputRef.current?.focus();
  }, [showCreate]);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    setError('');
    try {
      const group = await createGroup(supabase, name);
      setGroups((prev) => [group, ...prev]);
      setNewName('');
      setShowCreate(false);
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-on-surface">Your Squads</h1>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={16} />
          New Squad
        </Button>
      </div>

      {/* Create squad inline form */}
      {showCreate && (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-on-surface">Name your squad</h2>
            <button
              onClick={() => { setShowCreate(false); setNewName(''); setError(''); }}
              className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant"
            >
              <X size={18} />
            </button>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="e.g. The Boys, Brunch Gang..."
            className="w-full h-10 px-3 rounded-xl border border-outline-variant/40 bg-surface text-on-surface placeholder:text-outline text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={50}
          />
          {error && <p className="text-xs text-error">{error}</p>}
          <Button
            variant="primary"
            size="md"
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="self-end"
          >
            {creating ? 'Creating...' : 'Let\'s go 🚀'}
          </Button>
        </div>
      )}

      {groups.length === 0 && !showCreate ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <span className="text-4xl">🫂</span>
          <p className="font-heading font-bold text-on-surface">No squads yet</p>
          <p className="text-sm text-on-surface-variant text-center">
            Create a squad and get your people together
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
