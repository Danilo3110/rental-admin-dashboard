import { describe, expect, it } from 'vitest';
import { monthSummary, nightsWithin, percentChange, upcomingCheckIns } from './stats.js';

const reservation = (overrides) => ({
  id: 'BR-1',
  propertyId: 'breza',
  checkIn: '2026-11-28',
  nights: 4,
  total: 400,
  status: 'confirmed',
  channel: 'website',
  ...overrides,
});

describe('nightsWithin', () => {
  it('counts only the nights that fall inside the period', () => {
    // 28 Nov – 2 Dec: 3 nights in November (28, 29, 30) and 1 in December.
    const r = reservation();
    expect(nightsWithin(r, new Date(2026, 10, 1), new Date(2026, 11, 1))).toBe(3);
    expect(nightsWithin(r, new Date(2026, 11, 1), new Date(2027, 0, 1))).toBe(1);
  });

  it('returns 0 when the stay is outside the period', () => {
    expect(nightsWithin(reservation(), new Date(2026, 9, 1), new Date(2026, 10, 1))).toBe(0);
  });
});

describe('monthSummary', () => {
  it('splits revenue across months by nights and ignores cancelled stays', () => {
    const list = [reservation(), reservation({ id: 'BR-2', status: 'cancelled', total: 999 })];
    const november = monthSummary(list, 1, new Date(2026, 10, 1));
    expect(november.revenue).toBe(300);
    expect(november.nights).toBe(3);
    expect(november.checkIns).toBe(1);
    expect(november.occupancy).toBeCloseTo(3 / 30);

    const december = monthSummary(list, 1, new Date(2026, 11, 1));
    expect(december.revenue).toBe(100);
    expect(december.checkIns).toBe(0); // the guest arrived in November
  });
});

describe('percentChange', () => {
  it('returns the relative change, or null without a previous value', () => {
    expect(percentChange(120, 100)).toBeCloseTo(0.2);
    expect(percentChange(80, 100)).toBeCloseTo(-0.2);
    expect(percentChange(50, 0)).toBeNull();
  });
});

describe('upcomingCheckIns', () => {
  it('returns active arrivals in the next days, sorted by date', () => {
    const today = new Date(2026, 10, 25);
    const list = [
      reservation({ id: 'BR-3', checkIn: '2026-11-27' }),
      reservation({ id: 'BR-4', checkIn: '2026-11-25' }),
      reservation({ id: 'BR-5', checkIn: '2026-11-26', status: 'cancelled' }),
      reservation({ id: 'BR-6', checkIn: '2026-12-10' }),
    ];
    expect(upcomingCheckIns(list, today, 7).map((r) => r.id)).toEqual(['BR-4', 'BR-3']);
  });
});
