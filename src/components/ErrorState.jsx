import { useDispatch, useSelector } from 'react-redux';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import { fetchReservations } from '../store/reservationsSlice.js';
import { selectLoadError } from '../store/selectors.js';

export default function ErrorState() {
  const dispatch = useDispatch();
  const error = useSelector(selectLoadError);

  return (
    <Alert
      severity="error"
      variant="outlined"
      action={
        <Button
          color="inherit"
          startIcon={<RefreshRounded />}
          onClick={() => dispatch(fetchReservations())}
        >
          Try again
        </Button>
      }
    >
      <AlertTitle>Could not load reservations</AlertTitle>
      {error}
    </Alert>
  );
}
