'use client';

import { useState } from 'react';
import { X, Plus, MapPin, Calendar, Clock, Trash2 } from 'lucide-react';
import { createEvent } from '@down/common';
import type { CreateEventInput, EventSuggestion } from '@down/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';

interface Props {
  groupId: string;
  onClose: () => void;
  onCreated: (event: EventSuggestion) => void;
}

interface TimeOption {
  date: string;
  time: string;
}

export function CreateEventModal({ groupId, onClose, onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [timeOptions, setTimeOptions] = useState<TimeOption[]>([{ date: '', time: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = title.trim().length > 0;

  const updateTimeOption = (index: number, field: keyof TimeOption, value: string) => {
    setTimeOptions((prev) => prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt)));
  };

  const addTimeOption = () => setTimeOptions((prev) => [...prev, { date: '', time: '' }]);

  const removeTimeOption = (index: number) =>
    setTimeOptions((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError('');

    const filledOptions = timeOptions.filter((o) => o.date.trim() || o.time.trim());

    const input: CreateEventInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      group_id: groupId,
      time_options: filledOptions.length > 0 ? filledOptions : undefined,
    };

    try {
      const created = await createEvent(supabase, input);
      onCreated(created);
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-surface w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <h2 className="font-heading font-bold text-xl text-primary italic -rotate-1">
            new hangout!
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 overflow-y-auto px-5 pb-6">
          {/* Title */}
          <div>
            <Input
              id="event-title"
              label="What are we doing? *"
              placeholder="name your vibe..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Location */}
          <Input
            id="event-location"
            label="Where at?"
            placeholder="pick a spot"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            icon={<MapPin size={14} />}
          />

          {/* Time options */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">
              When? (optional)
            </span>
            <div className="flex flex-col gap-3 bg-surface-container-low rounded-xl p-3">
              {timeOptions.map((opt, index) => (
                <div key={index} className="flex flex-col gap-2">
                  {timeOptions.length > 1 && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-outline uppercase tracking-widest">
                        Option {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeTimeOption(index)}
                        className="text-outline hover:text-error transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="MM/DD/YYYY"
                      value={opt.date}
                      onChange={(e) => updateTimeOption(index, 'date', e.target.value)}
                      icon={<Calendar size={13} />}
                    />
                    <Input
                      placeholder="7:00 PM"
                      value={opt.time}
                      onChange={(e) => updateTimeOption(index, 'time', e.target.value)}
                      icon={<Clock size={13} />}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addTimeOption}
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/70 transition-colors self-start"
              >
                <Plus size={13} />
                suggest another time
              </button>
            </div>
            <p className="text-[10px] text-outline uppercase tracking-widest">
              heads up: no flaking allowed!
            </p>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">
              Any deets?
            </label>
            <textarea
              placeholder="mention the vibe, dress code, what to bring..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-input border border-outline-variant/40 bg-surface-container-low px-4 py-2.5 text-sm text-on-surface placeholder:text-outline resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors italic"
            />
          </div>

          {error && (
            <p className="text-sm text-error">{error}</p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            disabled={!canSubmit || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Posting...' : 'Post to Squad'}
          </Button>
        </form>
      </div>
    </div>
  );
}
