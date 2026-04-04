import { useState, useEffect } from 'react';

export interface VotingCountdown {
  /** Formatted time remaining, e.g. "2d 4h", "3h 12m", "45m 20s". Null if no deadline or expired. */
  timeLeft: string | null;
  isExpired: boolean;
}

function formatTimeLeft(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const days  = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const mins  = Math.floor((totalSecs % 3600) / 60);
  const secs  = totalSecs % 60;

  if (days >= 1)  return `${days}d ${hours}h`;
  if (hours >= 1) return `${hours}h ${mins}m`;
  if (mins >= 1)  return `${mins}m ${secs}s`;
  return `${secs}s`;
}

/**
 * Counts down to `votingEndsAt` (ISO string), ticking every second.
 * Returns { timeLeft, isExpired }.
 */
export function useVotingCountdown(votingEndsAt?: string): VotingCountdown {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!votingEndsAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [votingEndsAt]);

  if (!votingEndsAt) return { timeLeft: null, isExpired: false };

  const ms = new Date(votingEndsAt).getTime() - now;
  if (ms <= 0) return { timeLeft: null, isExpired: true };
  return { timeLeft: formatTimeLeft(ms), isExpired: false };
}
