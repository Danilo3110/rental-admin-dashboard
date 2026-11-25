import { Link as RouterLink } from 'react-router';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import { PROPERTY_BY_ID } from '../data/catalog.js';
import { TODAY } from '../store/selectors.js';
import { formatNights, formatRelativeDay } from '../utils/format.js';
import ChartCard from './ChartCard.jsx';
import GuestAvatar from './GuestAvatar.jsx';
import StatusChip from './StatusChip.jsx';

const MAX_ITEMS = 5;

export default function UpcomingCheckIns({ items, loading }) {
  return (
    <ChartCard
      title="Upcoming check-ins"
      subtitle="Next 7 days"
      action={
        <Button
          component={RouterLink}
          to="/reservations?sort=checkIn:asc"
          size="small"
          endIcon={<ArrowForwardRounded />}
        >
          All
        </Button>
      }
    >
      {loading ? (
        Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} variant="rounded" height={52} sx={{ mb: 1 }} />
        ))
      ) : items.length === 0 ? (
        <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
          No check-ins in the next 7 days.
        </Typography>
      ) : (
        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {items.slice(0, MAX_ITEMS).map((reservation) => {
            const relativeDay = formatRelativeDay(reservation.checkIn, TODAY);
            return (
              <Box
                component="li"
                key={reservation.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  py: 1.25,
                  borderBottom: 1,
                  borderColor: 'divider',
                  '&:last-of-type': { borderBottom: 0 },
                }}
              >
                <GuestAvatar name={reservation.guestName} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography noWrap sx={{ fontWeight: 600 }}>
                    {reservation.guestName}
                  </Typography>
                  <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
                    {PROPERTY_BY_ID[reservation.propertyId].name} ·{' '}
                    {formatNights(reservation.nights)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'grid', justifyItems: 'end', gap: 0.5 }}>
                  <Chip
                    size="small"
                    label={relativeDay}
                    color={relativeDay === 'Today' ? 'primary' : 'default'}
                    variant={relativeDay === 'Today' ? 'filled' : 'outlined'}
                  />
                  {reservation.status === 'pending' && <StatusChip status="pending" />}
                </Box>
              </Box>
            );
          })}
          {items.length > MAX_ITEMS && (
            <Typography variant="body2" sx={{ pt: 1.5, color: 'text.secondary' }}>
              +{items.length - MAX_ITEMS} more this week
            </Typography>
          )}
        </Box>
      )}
    </ChartCard>
  );
}
