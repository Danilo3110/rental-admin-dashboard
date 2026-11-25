import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { CHANNELS, PROPERTIES, PROPERTY_BY_ID } from '../data/catalog.js';
import { addReservation, selectAllReservations } from '../store/reservationsSlice.js';
import { TODAY } from '../store/selectors.js';
import { showToast } from '../store/uiSlice.js';
import { parseISODate, toISODate } from '../utils/dates.js';
import { formatCurrency, formatNights } from '../utils/format.js';
import { stayTotal } from '../utils/pricing.js';
import { validateReservation } from '../utils/reservations.js';

const TODAY_ISO = toISODate(TODAY);
const FIELD_ORDER = ['guestName', 'email', 'propertyId', 'checkIn', 'nights', 'guests'];

const INITIAL_VALUES = {
  guestName: '',
  email: '',
  propertyId: PROPERTIES[0].id,
  checkIn: '',
  nights: 3,
  guests: 2,
  channel: 'website',
  status: 'confirmed',
};

export default function NewReservationDialog({ open, onClose }) {
  const dispatch = useDispatch();
  const reservations = useSelector(selectAllReservations);
  const fullScreen = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const formik = useFormik({
    initialValues: INITIAL_VALUES,
    validate: (values) => validateReservation(values, reservations, TODAY_ISO),
    onSubmit: async (values, helpers) => {
      helpers.setStatus(null);
      try {
        const created = await dispatch(
          addReservation({
            ...values,
            guestName: values.guestName.trim(),
            email: values.email.trim(),
            nights: Number(values.nights),
            guests: Number(values.guests),
          }),
        ).unwrap();
        dispatch(showToast(`Reservation ${created.id} created for ${created.guestName}.`));
        helpers.resetForm();
        onClose(created.id);
      } catch (error) {
        helpers.setStatus(error.message ?? 'Could not save the reservation.');
      }
    },
  });

  const close = () => {
    formik.resetForm();
    onClose(null);
  };

  // After a failed submit, focus the first invalid field (helps keyboard and screen reader users).
  async function handleSubmit(event) {
    event.preventDefault();
    const errors = await formik.validateForm();
    await formik.submitForm();
    const firstInvalid = FIELD_ORDER.find((name) => errors[name]);
    if (firstInvalid) document.getElementById(`new-${firstInvalid}`)?.focus();
  }

  // Errors only show once the field has been touched or the form was submitted.
  const field = (name) => ({
    ...formik.getFieldProps(name),
    id: `new-${name}`,
    error: Boolean(formik.touched[name] && formik.errors[name]),
    helperText: formik.touched[name] && formik.errors[name],
    fullWidth: true,
  });

  const property = PROPERTY_BY_ID[formik.values.propertyId];
  const nights = Number(formik.values.nights);
  const showPrice =
    property && formik.values.checkIn && Number.isInteger(nights) && nights >= 1 && nights <= 30;

  return (
    <Dialog
      open={open}
      onClose={close}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: { component: 'form', onSubmit: handleSubmit, noValidate: true },
      }}
    >
      <DialogTitle>New reservation</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
          <TextField {...field('guestName')} label="Guest name" autoComplete="off" autoFocus />
          <TextField {...field('email')} label="Email" type="email" autoComplete="off" />
          <TextField {...field('propertyId')} label="Property" select>
            {PROPERTIES.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name} · up to {p.capacity}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            {...field('checkIn')}
            label="Check-in"
            type="date"
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: TODAY_ISO } }}
          />
          <TextField
            {...field('nights')}
            label="Nights"
            type="number"
            slotProps={{ htmlInput: { min: 1, max: 30 } }}
          />
          <TextField
            {...field('guests')}
            label="Guests"
            type="number"
            slotProps={{ htmlInput: { min: 1, max: property?.capacity ?? 10 } }}
          />
          <TextField {...field('channel')} label="Channel" select>
            {CHANNELS.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField {...field('status')} label="Status" select>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </TextField>
        </Box>

        <Box
          aria-live="polite"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 2.5,
            p: 2,
            borderRadius: 3,
            bgcolor: 'action.hover',
          }}
        >
          <Typography sx={{ color: 'text.secondary' }}>
            {showPrice
              ? `${property.name} · ${formatNights(nights)}`
              : 'Choose dates to see the price'}
          </Typography>
          <Typography variant="h6" component="p">
            {showPrice
              ? formatCurrency(stayTotal(property, parseISODate(formik.values.checkIn), nights))
              : '–'}
          </Typography>
        </Box>

        {formik.status && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {formik.status}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={close}>Cancel</Button>
        <Button type="submit" variant="contained" loading={formik.isSubmitting}>
          Create reservation
        </Button>
      </DialogActions>
    </Dialog>
  );
}
