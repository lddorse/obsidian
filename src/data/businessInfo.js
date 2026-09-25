import { formatTime } from '../utils/clock';

// Hours are in the bar's local time, whatever the visitor's time zone
export const timeZone = 'America/Chicago';

// days: 0 = Sunday ... 6 = Saturday. open/close are "HH:MM" 24h. Optional
// shortDay replaces day on narrow screens so the row stays on one line.
// A close at or before open means closing after midnight, on the next day
// (Friday 07:00-00:00 closes at 12:00 AM Saturday).
const schedule = [
  { day: 'Monday - Thursday', shortDay: 'Mon - Thu', days: [1, 2, 3, 4], open: '07:00', close: '22:00' },
  { day: 'Friday', days: [5], open: '07:00', close: '00:00' },
  { day: 'Saturday', days: [6], open: '08:00', close: '00:00' },
  { day: 'Sunday', days: [0], open: '08:00', close: '20:00' }
];

export const hours = {
  title: 'HOURS',
  schedule: schedule.map((row) => ({
    ...row,
    time: `${formatTime(row.open)} - ${formatTime(row.close)}`
  }))
};

export const locationInfo = {
  title: 'LOCATION & ABOUT',
  address: '123 Main Street, Downtown District',
  city: 'Your City, ST 12345',
  description: 'Obsidian is a specialty coffee roastery and craft cocktail bar located in the heart of downtown. We roast our own beans and craft cocktails that pair perfectly with our coffee selection.',
  directions: {
    title: 'FINDING US',
    note: 'ENTRANCE IN ALLEY',
    steps: [
      'Located on Main Street between 1st and 2nd Avenue',
      'Look for the obsidian stone marker on the building',
      'Enter through the alley on the west side',
      'Follow the amber lights to our door',
      'Ring bell if door is closed'
    ]
  }
};
