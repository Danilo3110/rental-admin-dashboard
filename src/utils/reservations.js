import { PROPERTY_BY_ID } from '../data/catalog.js';
import { addDays, parseISODate } from './dates.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function checkOutOf(reservation) {
  return addDays(parseISODate(reservation.checkIn), reservation.nights);
}

/** Case- and accent-insensitive search: "petrovic" matches "Petrović". */
export function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/đ/g, 'dj')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function filterReservations(list, { query = '', status = 'all', propertyId = 'all' } = {}) {
  const needle = normalizeText(query.trim());
  return list.filter(
    (r) =>
      (status === 'all' || r.status === status) &&
      (propertyId === 'all' || r.propertyId === propertyId) &&
      (!needle || normalizeText(`${r.id} ${r.guestName} ${r.email}`).includes(needle)),
  );
}

function compareValues(a, b) {
  return typeof a === 'number' && typeof b === 'number'
    ? a - b
    : String(a).localeCompare(String(b));
}

/** Returns a new sorted array. Ties are broken by ID so the order is stable. */
export function sortReservations(list, { field = 'checkIn', direction = 'desc' } = {}) {
  const factor = direction === 'asc' ? 1 : -1;
  // Properties sort by name, not by internal ID.
  const valueOf = (r) => (field === 'propertyId' ? PROPERTY_BY_ID[r.propertyId]?.name : r[field]);
  return [...list].sort(
    (a, b) => compareValues(valueOf(a), valueOf(b)) * factor || a.id.localeCompare(b.id),
  );
}

/** Whether the stay overlaps an existing (non-cancelled) reservation for the same property. */
export function overlapsExisting(list, { propertyId, checkIn, nights, ignoreId = null }) {
  const start = parseISODate(checkIn);
  const end = addDays(start, nights);
  return list.some(
    (r) =>
      r.id !== ignoreId &&
      r.propertyId === propertyId &&
      r.status !== 'cancelled' &&
      parseISODate(r.checkIn) < end &&
      start < checkOutOf(r),
  );
}

/** Validates the new reservation form. Returns { field: message } (Formik format). */
export function validateReservation(values, existing, todayISO) {
  const errors = {};
  const property = PROPERTY_BY_ID[values.propertyId];
  const nights = Number(values.nights);
  const guests = Number(values.guests);

  if (values.guestName.trim().length < 2) errors.guestName = 'Enter the guest name.';
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Enter a valid email address.';
  if (!property) errors.propertyId = 'Choose a property.';

  if (!values.checkIn) errors.checkIn = 'Choose a check-in date.';
  else if (values.checkIn < todayISO) errors.checkIn = 'Check-in cannot be in the past.';

  if (!Number.isInteger(nights) || nights < 1 || nights > 30) errors.nights = '1 to 30 nights.';
  if (property && (!Number.isInteger(guests) || guests < 1 || guests > property.capacity)) {
    errors.guests = `1 to ${property.capacity} guests.`;
  }

  const datesValid = !errors.checkIn && !errors.nights && property;
  if (
    datesValid &&
    values.status !== 'cancelled' &&
    overlapsExisting(existing, { propertyId: property.id, checkIn: values.checkIn, nights })
  ) {
    errors.checkIn = `${property.name} is already booked on these dates.`;
  }
  return errors;
}
