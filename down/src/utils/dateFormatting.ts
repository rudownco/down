// Date formatting utilities
// Translated from ios/down/Services/DateFormatting.swift

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

/** Format an ISO8601 timestamp to a relative string (e.g. "2h ago", "3d ago") */
export function relativeFormatted(isoString: string): string {
  const date = dayjs(isoString);
  if (!date.isValid()) return isoString;
  return date.fromNow();
}

/** Format a Date to "Friday, Mar 21" */
export function formatEventDate(date: Date): string {
  return dayjs(date).format('dddd, MMM D');
}

/** Format a Date to "7:00 PM" */
export function formatEventTime(date: Date): string {
  return dayjs(date).format('h:mm A');
}
