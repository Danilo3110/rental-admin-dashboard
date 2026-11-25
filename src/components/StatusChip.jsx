import Chip from '@mui/material/Chip';
import { STATUS_LABELS } from '../data/catalog.js';

export default function StatusChip({ status, size = 'small' }) {
  return (
    <Chip
      size={size}
      label={STATUS_LABELS[status]}
      sx={(theme) => ({
        color: theme.palette.status[status].color,
        bgcolor: theme.palette.status[status].bg,
        borderRadius: 1.5,
      })}
    />
  );
}
