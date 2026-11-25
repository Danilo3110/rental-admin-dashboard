import { describe, expect, it } from 'vitest';
import { generateReservations } from '../data/generateReservations.js';
import { parseISODate } from './dates.js';
import {
  checkOutOf,
  filterReservations,
  overlapsExisting,
  sortReservations,
  validateReservation,
} from './reservations.js';

const list = [
  {
    id: 'BR-1',
    guestName: 'Ana Đorđević',
    email: 'ana@example.com',
    propertyId: 'breza',
    checkIn: '2026-12-01',
    nights: 3,
    total: 300,
    status: 'confirmed',
  },
  {
    id: 'BR-2',
    guestName: 'Petar Petrović',
    email: 'petar@example.com',
    propertyId: 'lipa',
    checkIn: '2026-12-05',
    nights: 2,
    total: 120,
    status: 'pending',
  },
  {
    id: 'BR-3',
    guestName: 'Emma Weber',
    email: 'emma@example.com',
    propertyId: 'breza',
    checkIn: '2026-12-10',
    nights: 4,
    total: 450,
    status: 'cancelled',
  },
];

describe('filterReservations', () => {
  it('finds guests regardless of case and diacritics', () => {
    expect(filterReservations(list, { query: 'petrovic' }).map((r) => r.id)).toEqual(['BR-2']);
    expect(filterReservations(list, { query: 'DJORDJ' }).map((r) => r.id)).toEqual(['BR-1']);
  });

  it('combines status and property filters', () => {
    expect(filterReservations(list, { propertyId: 'breza', status: 'confirmed' })).toHaveLength(1);
    expect(filterReservations(list, { status: 'all', propertyId: 'all' })).toHaveLength(3);
  });
});

describe('sortReservations', () => {
  it('sorts numbers and strings in both directions without changing the input', () => {
    expect(sortReservations(list, { field: 'total', direction: 'asc' }).map((r) => r.id)).toEqual([
      'BR-2',
      'BR-1',
      'BR-3',
    ]);
    expect(sortReservations(list, { field: 'guestName', direction: 'desc' })[0].id).toBe('BR-2');
    expect(list[0].id).toBe('BR-1');
  });
});

describe('overlapsExisting', () => {
  it('detects overlapping stays but allows check-in on the check-out day', () => {
    const base = { propertyId: 'breza', nights: 2 };
    expect(overlapsExisting(list, { ...base, checkIn: '2026-12-02' })).toBe(true);
    expect(overlapsExisting(list, { ...base, checkIn: '2026-12-04' })).toBe(false); // BR-1 checks out on 4 Dec
    expect(overlapsExisting(list, { ...base, checkIn: '2026-12-11' })).toBe(false); // BR-3 is cancelled
  });
});

describe('validateReservation', () => {
  const valid = {
    guestName: 'Marko Ilić',
    email: 'marko@example.com',
    propertyId: 'lipa',
    checkIn: '2026-12-20',
    nights: 2,
    guests: 2,
    channel: 'website',
    status: 'confirmed',
  };

  it('accepts a valid reservation', () => {
    expect(validateReservation(valid, list, '2026-11-25')).toEqual({});
  });

  it('rejects past dates, too many guests and double bookings', () => {
    expect(
      validateReservation({ ...valid, checkIn: '2026-11-01' }, list, '2026-11-25').checkIn,
    ).toMatch(/past/);
    expect(validateReservation({ ...valid, guests: 3 }, list, '2026-11-25').guests).toBe(
      '1 to 2 guests.',
    );
    expect(
      validateReservation({ ...valid, checkIn: '2026-12-05' }, list, '2026-11-25').checkIn,
    ).toMatch(/already booked/);
  });
});

describe('generateReservations', () => {
  const today = new Date(2026, 10, 25);
  const generated = generateReservations(today);

  it('is deterministic for the same day and seed', () => {
    expect(generateReservations(today)).toEqual(generated);
  });

  it('never double-books a property', () => {
    for (const r of generated) {
      const others = generated.filter((o) => o.id !== r.id && o.status !== 'cancelled');
      if (r.status === 'cancelled') continue;
      expect(overlapsExisting(others, r)).toBe(false);
    }
  });

  it('marks past stays as completed or cancelled', () => {
    const past = generated.filter((r) => checkOutOf(r) <= today);
    expect(past.length).toBeGreaterThan(0);
    expect(past.every((r) => ['completed', 'cancelled'].includes(r.status))).toBe(true);
    expect(generated.every((r) => parseISODate(r.createdAt) <= today)).toBe(true);
  });
});
