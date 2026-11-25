import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import TrendingDownRounded from '@mui/icons-material/TrendingDownRounded';
import TrendingUpRounded from '@mui/icons-material/TrendingUpRounded';
import { formatChange } from '../utils/format.js';

export default function KpiCard({ label, value, change, icon, loading }) {
  const up = change !== null && change >= 0;

  return (
    <Card>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {label}
          </Typography>
          <Box
            aria-hidden="true"
            sx={{
              display: 'grid',
              placeItems: 'center',
              width: 38,
              height: 38,
              borderRadius: 2.5,
              color: 'primary.main',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            }}
          >
            {icon}
          </Box>
        </Box>

        {loading ? (
          <>
            <Skeleton variant="text" width="55%" sx={{ fontSize: '2rem', mt: 1 }} />
            <Skeleton variant="text" width="40%" />
          </>
        ) : (
          <>
            <Typography variant="h4" component="p" sx={{ mt: 1 }}>
              {value}
            </Typography>
            {change !== null && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.25,
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: up ? 'success.main' : 'error.main',
                  }}
                >
                  {up ? (
                    <TrendingUpRounded fontSize="small" aria-hidden="true" />
                  ) : (
                    <TrendingDownRounded fontSize="small" aria-hidden="true" />
                  )}
                  {formatChange(change)}
                </Box>
                <Typography variant="body2" component="span" sx={{ color: 'text.secondary' }}>
                  vs last month
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
