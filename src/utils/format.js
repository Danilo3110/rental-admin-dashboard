import { addDays, diffInDays, parseISODate } from './dates.js';

const currency = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const compactCurrency = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  notation: 'compact',
  maximumFractionDigits: 1,
});
const percent = new Intl.NumberFormat('en', { style: 'percent', maximumFractionDigits: 0 });
const signedPercent = new Intl.NumberFormat('en', {
  style: 'percent',
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
});
const shortDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
const fullDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const weekdayDate = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});
const longToday = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});
const shortToday = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});
const monthShort = new Intl.DateTimeFormat('en-GB', { month: 'short' });
const monthLong = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' });

export const formatCurrency = (value) => currency.format(value);
export const formatCompactCurrency = (value) => compactCurrency.format(value);
export const formatPercent = (value) => percent.format(value);
export const formatChange = (value) => signedPercent.format(value);
export const formatDate = (iso) => shortDate.format(parseISODate(iso));
export const formatFullDate = (iso) => fullDate.format(parseISODate(iso));
export const formatMonthShort = (date) => monthShort.format(date);
export const formatMonthLong = (date) => monthLong.format(date);
export const formatToday = (date) => longToday.format(date);
export const formatTodayShort = (date) => shortToday.format(date);

export function formatNights(nights) {
  return `${nights} ${nights === 1 ? 'night' : 'nights'}`;
}

/** "Today", "Tomorrow" or e.g. "Fri, 28 Nov". */
export function formatRelativeDay(iso, today) {
  const days = diffInDays(today, parseISODate(iso));
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return weekdayDate.format(parseISODate(iso));
}

export function formatStay(reservation) {
  const checkOut = addDays(parseISODate(reservation.checkIn), reservation.nights);
  return `${formatDate(reservation.checkIn)} – ${shortDate.format(checkOut)}`;
}

export function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}
