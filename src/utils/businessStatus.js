import { hours, timeZone as barTimeZone } from '../data/businessInfo';
import { toMinutes, formatMinutes } from './clock';

const DAY = 24 * 60;
const WEEK = 7 * DAY;
const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const COMPACT = { compact: true };

// Minutes since Sunday 00:00 in the given time zone
const minuteOfWeek = (date, timeZone) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    })
      .formatToParts(date)
      .map(({ type, value }) => [type, value])
  );
  const day = WEEKDAYS.indexOf(parts.weekday.toUpperCase());
  return day * DAY + Number(parts.hour) * 60 + Number(parts.minute);
};

// Each opening as [start, end) in minutes of the week. end can run past
// WEEK when Saturday closes after midnight.
const weeklyIntervals = (schedule) =>
  schedule.flatMap(({ days, open, close }) =>
    days.map((day) => {
      const start = day * DAY + toMinutes(open);
      let end = day * DAY + toMinutes(close);
      if (end <= start) end += DAY;
      return { start, end };
    })
  );

/**
 * Whether the bar is open at `now`, in the bar's time zone.
 * Returns { isOpen, closesAt, opensAt }, with times in compact form:
 *   closesAt: "12 AM" (when open)
 *   opensAt:  { daysAhead, weekday, time } for the next opening (when closed)
 */
export const getBusinessStatus = (
  now = new Date(),
  { schedule = hours.schedule, timeZone = barTimeZone } = {}
) => {
  const current = minuteOfWeek(now, timeZone);
  const intervals = weeklyIntervals(schedule);

  // Check a week later too, for Saturday-night hours spilling into Sunday
  const openInterval = intervals.find(({ start, end }) =>
    [current, current + WEEK].some((t) => t >= start && t < end)
  );
  if (openInterval) {
    return { isOpen: true, closesAt: formatMinutes(openInterval.end % DAY, COMPACT), opensAt: null };
  }

  const nextStart = Math.min(
    ...intervals.map(({ start }) => (start > current ? start : start + WEEK))
  );
  return {
    isOpen: false,
    closesAt: null,
    opensAt: {
      daysAhead: Math.floor(nextStart / DAY) - Math.floor(current / DAY),
      weekday: WEEKDAYS[Math.floor(nextStart / DAY) % 7],
      time: formatMinutes(nextStart % DAY, COMPACT)
    }
  };
};

// "7 AM" today, "TOMORROW 8 AM", otherwise "MON 7 AM"
export const formatOpensAt = ({ daysAhead, weekday, time }) => {
  if (daysAhead === 0) return time;
  if (daysAhead === 1) return `TOMORROW ${time}`;
  return `${weekday} ${time}`;
};
