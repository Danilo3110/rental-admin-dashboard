// Pure stats functions with no Redux or React, so they are easy to test.
import { CHANNELS } from '../data/catalog.js';
import {
  addDays,
  addMonths,
  daysInMonth,
  diffInDays,
  parseISODate,
  startOfMonth,
} from './dates.js';

const isActive = (reservation) => reservation.status !== 'cancelled';

/** Number of the reservation's nights that fall within [from, to). */
export function nightsWithin(reservation, from, to) {
  const start = parseISODate(reservation.checkIn);
  const end = addDays(start, reservation.nights);
  const clippedStart = start > from ? start : from;
  const clippedEnd = end < to ? end : to;
  return Math.max(0, diffInDays(clippedStart, clippedEnd));
}

/**
 * Totals for one month. Revenue is split per night, so a stay that crosses a month
 * boundary counts toward both months proportionally.
 */
export function monthSummary(reservations, propertyCount, monthStart) {
  const nextMonth = addMonths(monthStart, 1);
  let revenue = 0;
  let nights = 0;
  let checkIns = 0;

  for (const reservation of reservations) {
    if (!isActive(reservation)) continue;
    const nightsInMonth = nightsWithin(reservation, monthStart, nextMonth);
    if (nightsInMonth === 0) continue;
    nights += nightsInMonth;
    revenue += (reservation.total / reservation.nights) * nightsInMonth;
    if (parseISODate(reservation.checkIn) >= monthStart) checkIns += 1;
  }

  const capacity = propertyCount * daysInMonth(monthStart);
  return {
    revenue: Math.round(revenue),
    nights,
    checkIns,
    occupancy: capacity ? nights / capacity : 0,
    averageRate: nights ? revenue / nights : 0,
  };
}

/** Change relative to the previous period (0.12 = +12%), or null when there is no baseline. */
export function percentChange(current, previous) {
  return previous ? (current - previous) / previous : null;
}

export function monthlySeries(reservations, propertyCount, today, months = 12) {
  const first = addMonths(startOfMonth(today), -(months - 1));
  return Array.from({ length: months }, (_, index) => {
    const month = addMonths(first, index);
    return { month, ...monthSummary(reservations, propertyCount, month) };
  });
}

export function channelBreakdown(reservations, since) {
  const counts = Object.fromEntries(CHANNELS.map((channel) => [channel.id, 0]));
  for (const reservation of reservations) {
    if (isActive(reservation) && parseISODate(reservation.checkIn) >= since) {
      counts[reservation.channel] += 1;
    }
  }
  return CHANNELS.map((channel) => ({ ...channel, count: counts[channel.id] }));
}

export function propertyMonthStats(reservations, property, monthStart) {
  const own = reservations.filter((r) => r.propertyId === property.id);
  return monthSummary(own, 1, monthStart);
}

export function upcomingCheckIns(reservations, today, days = 7) {
  const until = addDays(today, days);
  return reservations
    .filter((r) => {
      const checkIn = parseISODate(r.checkIn);
      return isActive(r) && checkIn >= today && checkIn < until;
    })
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn) || a.id.localeCompare(b.id));
}
