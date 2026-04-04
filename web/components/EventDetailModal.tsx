'use client';

import { useState } from 'react';
import { X, MapPin, Calendar, Clock, Check } from 'lucide-react';
import { AvatarCircle, AvatarStack, RSVPButtons, EventStatusMeta, getEventEmoji, getRsvpUsers } from '@down/common';
import { submitVotes, submitRSVP } from '@down/common';
import type { EventSuggestion, RSVPStatus } from '@down/common';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Props {
  event: EventSuggestion;
  currentUserId?: string;
  onClose: () => void;
  onEventUpdated: (updated: EventSuggestion) => void;
}

export function EventDetailModal({ event: initialEvent, currentUserId, onClose, onEventUpdated }: Props) {
  const [event, setEvent] = useState(initialEvent);

  // Voting state
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState('');
  const [voteCast, setVoteCast] = useState(false);

  // RSVP state
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus | undefined>(
    event.rsvps?.find((r) => r.userId === currentUserId)?.status
  );
  const [isRsvping, setIsRsvping] = useState(false);

  const emoji = getEventEmoji(event.title);
  const meta = EventStatusMeta[event.status];
  const maxVotes = Math.max(0, ...(event.votingOptions ?? []).map((o) => o.votes));

  const goingUsers = getRsvpUsers(event, 'going', event.attendees ?? []);
  const maybeUsers = getRsvpUsers(event, 'maybe', event.attendees ?? []);
  const notGoingUsers = getRsvpUsers(event, 'not_going', event.attendees ?? []);

  function toggleOption(optionId: string) {
    setSelectedOptionIds((prev) =>
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
    );
  }

  async function handleVote() {
    if (selectedOptionIds.length === 0) return;
    setIsVoting(true);
    setVoteError('');
    try {
      const updated = await submitVotes(supabase, event.id, selectedOptionIds);
      setEvent(updated);
      onEventUpdated(updated);
      setVoteCast(true);
      setSelectedOptionIds([]);
    } catch (e: any) {
      setVoteError(e?.message ?? 'Something went wrong');
    } finally {
      setIsVoting(false);
    }
  }

  async function handleRsvp(status: RSVPStatus) {
    setRsvpStatus(status);
    setIsRsvping(true);
    try {
      const rsvp = await submitRSVP(supabase, event.id, status);
      const updatedRsvps = [
        ...(event.rsvps ?? []).filter((r) => r.userId !== rsvp.userId),
        rsvp,
      ];
      const updated = { ...event, rsvps: updatedRsvps };
      setEvent(updated);
      onEventUpdated(updated);
    } catch (e: any) {
      setRsvpStatus(undefined);
    } finally {
      setIsRsvping(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-surface w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <span className="text-3xl flex-shrink-0">{emoji}</span>
            <div className="min-w-0">
              <h2 className="font-heading font-bold text-xl text-on-surface leading-tight">
                {event.title}
              </h2>
              {event.description && (
                <p className="text-sm text-on-surface-variant mt-0.5 line-clamp-2">
                  {event.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={cn(
              'text-xs font-medium px-2.5 py-0.5 rounded-chip whitespace-nowrap',
              event.status === 'voting'    ? 'bg-[#FFEFC7] text-[#D17D04]' :
              event.status === 'confirmed' ? 'bg-[#D8F8E7] text-[#1AA04F]' :
              'bg-[#EEEFF5] text-[#7D859E]'
            )}>
              {meta.emoji} {meta.label}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Event details */}
        {(event.location || event.date || event.time) && (
          <div className="flex flex-col gap-1.5 px-5 pb-4 text-sm text-on-surface-variant flex-shrink-0">
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin size={13} className="flex-shrink-0" />
                <span>{event.location}</span>
              </div>
            )}
            {(event.date || event.time) && (
              <div className="flex items-center gap-2">
                <Calendar size={13} className="flex-shrink-0" />
                <span>{[event.date, event.time].filter(Boolean).join(' · ')}</span>
              </div>
            )}
          </div>
        )}

        <div className="overflow-y-auto flex flex-col gap-5 px-5 pb-6">

          {/* ── VOTING MODE ── */}
          {event.status === 'voting' && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-heading font-semibold text-on-surface">
                {voteCast ? '✅ Vote cast! Change your pick:' : 'Pick your times 🗳️'}
              </p>
              <div className="flex flex-col gap-2">
                {(event.votingOptions ?? []).map((option) => {
                  const isSelected = selectedOptionIds.includes(option.id);
                  const barWidth = maxVotes > 0 ? (option.votes / maxVotes) * 100 : 0;
                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleOption(option.id)}
                      className={cn(
                        'relative w-full text-left p-3.5 rounded-card border-2 transition-all overflow-hidden',
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40'
                      )}
                    >
                      <div
                        className="absolute inset-0 bg-primary/5 transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                      <div className="relative flex items-center justify-between gap-3">
                        <div>
                          <p className="font-heading font-semibold text-sm text-on-surface">
                            {option.date}
                          </p>
                          <p className="text-xs text-on-surface-variant flex items-center gap-1">
                            <Clock size={11} />
                            {option.time}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {option.voters?.length > 0 && (
                            <AvatarStack users={option.voters} maxVisible={3} size="xs" />
                          )}
                          <span className="text-xs text-on-surface-variant font-medium">
                            {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
                          </span>
                          {option.votes === maxVotes && maxVotes > 0 && (
                            <span className="text-[10px] bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded-chip font-medium">
                              🔥 Leading
                            </span>
                          )}
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check size={11} className="text-on-primary" />
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {voteError && <p className="text-xs text-error">{voteError}</p>}
              <Button
                variant="primary"
                disabled={selectedOptionIds.length === 0 || isVoting}
                onClick={handleVote}
                className="w-full"
              >
                {isVoting
                  ? 'Casting...'
                  : selectedOptionIds.length > 0
                  ? `Cast Vote (${selectedOptionIds.length})`
                  : 'Select at least one time'}
              </Button>
            </div>
          )}

          {/* ── RSVP ── (shown for all statuses) */}
          <div className="bg-surface-container-low rounded-card p-4 flex flex-col gap-3">
            <p className="text-sm font-heading font-semibold text-on-surface">
              You pulling up? 👀
            </p>
            <RSVPButtons
              selectedStatus={rsvpStatus}
              onSelect={handleRsvp}
            />
            {isRsvping && (
              <p className="text-xs text-outline text-center">Saving...</p>
            )}
          </div>

          {/* ── Attendee lists ── */}
          {(goingUsers.length > 0 || maybeUsers.length > 0 || notGoingUsers.length > 0) && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-heading font-semibold text-on-surface-variant uppercase tracking-wide">
                Who&apos;s down
              </p>
              {goingUsers.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs text-outline">✅ Going ({goingUsers.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {goingUsers.map((u) => (
                      <div key={u.id} className="flex items-center gap-1.5">
                        <AvatarCircle user={u} size="xs" />
                        <span className="text-xs text-on-surface">{u.name.split(' ')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {maybeUsers.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs text-outline">🤔 Maybe ({maybeUsers.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {maybeUsers.map((u) => (
                      <div key={u.id} className="flex items-center gap-1.5">
                        <AvatarCircle user={u} size="xs" />
                        <span className="text-xs text-on-surface">{u.name.split(' ')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {notGoingUsers.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs text-outline">😢 Can&apos;t make it ({notGoingUsers.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {notGoingUsers.map((u) => (
                      <div key={u.id} className="flex items-center gap-1.5">
                        <AvatarCircle user={u} size="xs" />
                        <span className="text-xs text-on-surface">{u.name.split(' ')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
