// Static reference data: properties, booking channels and reservation statuses.

export const PROPERTIES = [
  {
    id: 'breza',
    name: 'Apartman Breza',
    location: 'Zlatibor',
    capacity: 4,
    basePrice: 50,
    rating: 4.9,
    photo: 'photo-1522708323590-d24dbb6b0267',
  },
  {
    id: 'lipa',
    name: 'Studio Lipa',
    location: 'Zlatibor',
    capacity: 2,
    basePrice: 38,
    rating: 4.7,
    photo: 'photo-1505693416388-ac5ce068fe85',
  },
  {
    id: 'javor',
    name: 'Kuća Javor',
    location: 'Tara',
    capacity: 6,
    basePrice: 85,
    rating: 4.8,
    photo: 'photo-1470770841072-f978cf4d019e',
  },
  {
    id: 'dorcol',
    name: 'Loft Dorćol',
    location: 'Belgrade',
    capacity: 3,
    basePrice: 62,
    rating: 4.6,
    photo: 'photo-1502672260266-1c1ef2d93688',
  },
];

export const PROPERTY_BY_ID = Object.fromEntries(PROPERTIES.map((p) => [p.id, p]));

export const CHANNELS = [
  { id: 'website', label: 'Website', weight: 0.32 },
  { id: 'platforms', label: 'Booking platforms', weight: 0.43 },
  { id: 'direct', label: 'Phone & email', weight: 0.15 },
  { id: 'agency', label: 'Travel agency', weight: 0.1 },
];

export const CHANNEL_LABELS = Object.fromEntries(CHANNELS.map((c) => [c.id, c.label]));

export const STATUSES = ['confirmed', 'pending', 'completed', 'cancelled'];

export const STATUS_LABELS = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function photoUrl(id, width) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=70`;
}
