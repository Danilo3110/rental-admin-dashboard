import Avatar from '@mui/material/Avatar';
import { initials } from '../utils/format.js';

/** Derives the color from the name so the same guest always gets the same color. */
function colorIndex(name, count) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % count;
}

export default function GuestAvatar({ name, size = 36 }) {
  return (
    <Avatar
      aria-hidden="true"
      sx={(theme) => {
        const color = theme.palette.chart[colorIndex(name, theme.palette.chart.length)];
        return {
          width: size,
          height: size,
          fontSize: size * 0.38,
          fontWeight: 700,
          bgcolor: color,
          color: theme.palette.getContrastText(color),
        };
      }}
    >
      {initials(name)}
    </Avatar>
  );
}
