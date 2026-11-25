import { addDays } from './dates.js';

// Price multiplier per month (0 = January): winter and summer cost more.
const SEASON_FACTOR = [1.4, 1.4, 1.2, 1, 1, 1.1, 1.25, 1.25, 1, 1, 1, 1.4];

export function nightlyRate(property, date) {
  return Math.round(property.basePrice * SEASON_FACTOR[date.getMonth()]);
}

/** Total price of a stay: each night is charged at the rate of the month it falls in. */
export function stayTotal(property, checkIn, nights) {
  let total = 0;
  for (let night = 0; night < nights; night += 1) {
    total += nightlyRate(property, addDays(checkIn, night));
  }
  return total;
}
