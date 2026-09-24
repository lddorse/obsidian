// "HH:MM" (24h) <-> minutes since midnight, and display formatting

export const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

// 420 -> "7:00 AM", 0 -> "12:00 AM", 1320 -> "10:00 PM"
export const formatMinutes = (minutes) => {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`;
};

export const formatTime = (hhmm) => formatMinutes(toMinutes(hhmm));
