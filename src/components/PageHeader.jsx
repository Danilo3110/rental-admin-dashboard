import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/** Page title, subtitle and actions on the right. Also sets the browser tab title. */
export default function PageHeader({ title, subtitle, actions }) {
  useEffect(() => {
    document.title = `${title} · Breza Admin`;
  }, [title]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 2,
        mb: 3,
      }}
    >
      <Box>
        <Typography variant="h4" component="h1">
          {title}
        </Typography>
        {subtitle && <Typography sx={{ mt: 0.5, color: 'text.secondary' }}>{subtitle}</Typography>}
      </Box>
      {actions && <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{actions}</Box>}
    </Box>
  );
}
