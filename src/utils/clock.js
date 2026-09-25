// "HH:MM" (24h) <-> minutes since midnight, and display formatting

export const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

// 420 -> "7:00 AM", 0 -> "12:00 AM", 1320 -> "10:00 PM"
// compact drops ":00" on the hour: "7 AM", but keeps "7:30 AM"
export const formatMinutes = (minutes, { compact = false } = {}) => {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const time = compact && m === 0 ? `${h12}` : `${h12}:${String(m).padStart(2, '0')}`;
  return `${time} ${h24 < 12 ? 'AM' : 'PM'}`;
};

export const formatTime = (hhmm) => formatMinutes(toMinutes(hhmm));
