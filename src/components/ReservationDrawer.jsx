import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { CHANNEL_LABELS, PROPERTY_BY_ID } from '../data/catalog.js';
import { changeReservationStatus, selectReservationById } from '../store/reservationsSlice.js';
import { selectIsSaving } from '../store/selectors.js';
import { showToast } from '../store/uiSlice.js';
import { toISODate } from '../utils/dates.js';
import { formatCurrency, formatFullDate, formatNights } from '../utils/format.js';
import { checkOutOf } from '../utils/reservations.js';
import GuestAvatar from './GuestAvatar.jsx';
import StatusChip from './StatusChip.jsx';

function Detail({ label, children }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 500 }}>{children}</Typography>
    </Box>
  );
}

export default function ReservationDrawer({ reservationId, onClose }) {
  const dispatch = useDispatch();
  const reservation = useSelector((state) =>
    reservationId ? selectReservationById(state, reservationId) : null,
  );
  const saving = useSelector((state) => selectIsSaving(state, reservationId));
  const [confirmCancel, setConfirmCancel] = useState(false);

  async function setStatus(status) {
    try {
      await dispatch(changeReservationStatus({ id: reservation.id, status })).unwrap();
      const verb = status === 'confirmed' ? 'confirmed' : 'cancelled';
      dispatch(showToast(`Reservation ${reservation.id} ${verb}.`));
    } catch (error) {
      dispatch(showToast(error.message ?? 'Could not update the reservation.', 'error'));
    } finally {
      setConfirmCancel(false);
    }
  }

  const property = reservation ? PROPERTY_BY_ID[reservation.propertyId] : null;
  const checkOut = reservation ? checkOutOf(reservation) : null;
  const canConfirm = reservation?.status === 'pending';
  const canCancel = reservation?.status === 'pending' || reservation?.status === 'confirmed';

  return (
    <Drawer
      anchor="right"
      open={Boolean(reservation)}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 420 } } } }}
    >
      {reservation && (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, py: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Reservation
              </Typography>
              <Typography variant="h5" component="h2">
                {reservation.id}
              </Typography>
            </Box>
            <StatusChip status={reservation.status} size="medium" />
            <IconButton onClick={onClose} aria-label="Close details">
              <CloseRounded />
            </IconButton>
          </Box>
          <Divider />

          <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <GuestAvatar name={reservation.guestName} size={48} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
                  {reservation.guestName}
                </Typography>
                <Link href={`mailto:${reservation.email}`} variant="body2" noWrap>
                  {reservation.email}
                </Link>
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
              <Detail label="Property">{property.name}</Detail>
              <Detail label="Location">{property.location}</Detail>
              <Detail label="Check-in">{formatFullDate(reservation.checkIn)}</Detail>
              <Detail label="Check-out">{formatFullDate(toISODate(checkOut))}</Detail>
              <Detail label="Length of stay">{formatNights(reservation.nights)}</Detail>
              <Detail label="Guests">{reservation.guests}</Detail>
              <Detail label="Channel">{CHANNEL_LABELS[reservation.channel]}</Detail>
              <Detail label="Booked on">{formatFullDate(reservation.createdAt)}</Detail>
            </Box>

            <Box sx={{ mt: 3, p: 2, borderRadius: 3, bgcolor: 'action.hover' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography sx={{ color: 'text.secondary' }}>Average per night</Typography>
                <Typography>{formatCurrency(reservation.total / reservation.nights)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 700 }}>Total</Typography>
                <Typography sx={{ fontWeight: 700 }}>
                  {formatCurrency(reservation.total)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {(canConfirm || canCancel) && (
            <>
              <Divider />
              <Box sx={{ display: 'flex', gap: 1, px: 3, py: 2 }}>
                {canConfirm && (
                  <Button
                    variant="contained"
                    startIcon={<CheckCircleRounded />}
                    onClick={() => setStatus('confirmed')}
                    loading={saving}
                    sx={{ flex: 1 }}
                  >
                    Confirm
                  </Button>
                )}
                {canCancel && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setConfirmCancel(true)}
                    disabled={saving}
                    sx={{ flex: 1 }}
                  >
                    Cancel reservation
                  </Button>
                )}
              </Box>
            </>
          )}

          <Dialog open={confirmCancel} onClose={() => setConfirmCancel(false)}>
            <DialogTitle>Cancel {reservation.id}?</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {reservation.guestName} will no longer have a booking at {property.name} on{' '}
                {formatFullDate(reservation.checkIn)}. The dates become available again.
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setConfirmCancel(false)}>Keep reservation</Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => setStatus('cancelled')}
                loading={saving}
              >
                Cancel reservation
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Drawer>
  );
}
