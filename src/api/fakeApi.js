// In-memory fake backend. Every call is delayed a little to behave like a real API;
// in a real project this module would wrap fetch/axios calls to the server.
import { PROPERTY_BY_ID } from '../data/catalog.js';
import { generateReservations } from '../data/generateReservations.js';
import { parseISODate, toISODate } from '../utils/dates.js';
import { stayTotal } from '../utils/pricing.js';

let database = null;
const getDatabase = () => (database ??= generateReservations());

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const latency = () => wait(350 + Math.random() * 400);

// Add ?apiError to the URL to see how the app handles a server error.
const simulateError =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('apiError');

export async function fetchReservations() {
  await latency();
  if (simulateError) throw new Error('The server is not responding (simulated error).');
  return structuredClone(getDatabase());
}

export async function updateReservationStatus(id, status) {
  await latency();
  const reservation = getDatabase().find((r) => r.id === id);
  if (!reservation) throw new Error(`Reservation ${id} was not found.`);
  reservation.status = status;
  return { ...reservation };
}

export async function createReservation(input) {
  await latency();
  const db = getDatabase();
  const property = PROPERTY_BY_ID[input.propertyId];
  const nextNumber = Math.max(1000, ...db.map((r) => Number(r.id.slice(3)))) + 1;
  const reservation = {
    id: `BR-${nextNumber}`,
    ...input,
    total: stayTotal(property, parseISODate(input.checkIn), input.nights),
    createdAt: toISODate(new Date()),
  };
  db.push(reservation);
  return { ...reservation };
}
