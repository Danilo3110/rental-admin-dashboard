// Fake reservation generator. The same seed always produces the same data, and dates
// are relative to today, so the dashboard always looks current.
import { addDays, diffInDays, startOfDay, toISODate } from '../utils/dates.js';
import { stayTotal } from '../utils/pricing.js';
import { CHANNELS, PROPERTIES } from './catalog.js';

const FIRST_NAMES = [
  'Marija',
  'Stefan',
  'Ana',
  'Nikola',
  'Jelena',
  'Luka',
  'Milica',
  'Marko',
  'Ivana',
  'Petar',
  'Sara',
  'Thomas',
  'Emma',
  'Lukas',
  'Sophie',
  'Daniel',
  'Elena',
  'Matteo',
  'Hannah',
  'Jovan',
  'Teodora',
  'Filip',
  'Katarina',
  'Aleksa',
];
const LAST_NAMES = [
  'Petrović',
  'Jovanović',
  'Nikolić',
  'Marković',
  'Ilić',
  'Stojanović',
  'Müller',
  'Schmidt',
  'Rossi',
  'Novak',
  'Kovač',
  'Horvat',
  'Popović',
  'Đorđević',
  'Weber',
  'Bianchi',
  'Pavlović',
  'Simić',
  'Tomić',
  'Fischer',
];
const BUSY_MONTHS = [0, 1, 6, 7, 11];

/** Small deterministic PRNG (mulberry32). */
function createRandom(seed) {
  let state = seed;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function emailFor(first, last) {
  const ascii = `${first}.${last}`
    .toLowerCase()
    .replace(/đ/g, 'dj')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return `${ascii}@example.com`;
}

export function generateReservations(today = startOfDay(new Date()), seed = 20261125) {
  const random = createRandom(seed);
  const between = (min, max) => min + Math.floor(random() * (max - min + 1));
  const pick = (items) => items[Math.floor(random() * items.length)];
  const pickChannel = () => {
    let roll = random();
    for (const channel of CHANNELS) {
      roll -= channel.weight;
      if (roll <= 0) return channel.id;
    }
    return CHANNELS[0].id;
  };

  const rangeStart = addDays(today, -365);
  const rangeEnd = addDays(today, 60);
  const items = [];

  // Reservations for each property are generated back to back, so they never overlap.
  for (const property of PROPERTIES) {
    let checkIn = addDays(rangeStart, between(0, 5));
    while (checkIn < rangeEnd) {
      const busy = BUSY_MONTHS.includes(checkIn.getMonth());
      const nights = between(2, busy ? 7 : 5);
      const checkOut = addDays(checkIn, nights);
      const first = pick(FIRST_NAMES);
      const last = pick(LAST_NAMES);

      const roll = random();
      let status;
      if (checkOut <= today) status = roll < 0.08 ? 'cancelled' : 'completed';
      else if (checkIn <= today) status = 'confirmed';
      else status = roll < 0.07 ? 'cancelled' : roll < 0.3 ? 'pending' : 'confirmed';

      const createdAt = addDays(checkIn, -between(3, 60));
      items.push({
        propertyId: property.id,
        guestName: `${first} ${last}`,
        email: emailFor(first, last),
        checkIn: toISODate(checkIn),
        nights,
        guests: between(1, property.capacity),
        channel: pickChannel(),
        total: stayTotal(property, checkIn, nights),
        status,
        createdAt: toISODate(createdAt < today ? createdAt : today),
      });

      // Gap until the next guest: shorter in high season, longer for dates far in the future.
      const gap = busy ? between(0, 3) : between(1, 7);
      const fewerFutureBookings = diffInDays(today, checkIn) > 21 ? between(2, 10) : 0;
      checkIn = addDays(checkOut, gap + fewerFutureBookings);
    }
  }

  items.sort(
    (a, b) => a.createdAt.localeCompare(b.createdAt) || a.checkIn.localeCompare(b.checkIn),
  );
  return items.map((reservation, index) => ({ id: `BR-${1001 + index}`, ...reservation }));
}
