import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import PeopleRounded from '@mui/icons-material/PeopleRounded';
import PlaceRounded from '@mui/icons-material/PlaceRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import ErrorState from '../components/ErrorState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { photoUrl } from '../data/catalog.js';
import { selectLoadStatus, selectPropertyStats, THIS_MONTH } from '../store/selectors.js';
import { formatCurrency, formatMonthLong, formatPercent } from '../utils/format.js';

function Stat({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 700 }}>{value}</Typography>
    </Box>
  );
}

export default function PropertiesPage() {
  const status = useSelector(selectLoadStatus);
  const stats = useSelector(selectPropertyStats);
  const loading = status === 'idle' || status === 'loading';
  const hasStats = status === 'succeeded';
  const month = formatMonthLong(THIS_MONTH);

  return (
    <>
      <PageHeader title="Properties" subtitle={`Performance in ${month}`} />
      {status === 'failed' && (
        <Box sx={{ mb: 3 }}>
          <ErrorState />
        </Box>
      )}

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' },
        }}
      >
        {stats.map(({ property, month: monthStats, upcoming }) => (
          <Card key={property.id} sx={{ display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="img"
              height={170}
              image={photoUrl(property.photo, 640)}
              alt=""
              loading="lazy"
              sx={{ bgcolor: 'action.hover' }}
            />
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                  }}
                >
                  <Typography variant="h6" component="h2">
                    {property.name}
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.25,
                      fontWeight: 700,
                    }}
                    aria-label={`Rating ${property.rating} out of 5`}
                  >
                    <StarRounded
                      fontSize="small"
                      sx={{ color: 'secondary.main' }}
                      aria-hidden="true"
                    />
                    {property.rating}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  <Chip
                    size="small"
                    icon={<PlaceRounded />}
                    label={property.location}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    icon={<PeopleRounded />}
                    label={`Up to ${property.capacity}`}
                    variant="outlined"
                  />
                </Box>
              </Box>

              {loading && <Skeleton variant="rounded" height={92} />}
              {hasStats && (
                <>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Occupancy
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {formatPercent(monthStats.occupancy)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, monthStats.occupancy * 100)}
                      aria-label={`${property.name} occupancy`}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                    <Stat label="Revenue" value={formatCurrency(monthStats.revenue)} />
                    <Stat label="From" value={`${formatCurrency(property.basePrice)}`} />
                    <Stat label="Next 30 days" value={`${upcoming} arrivals`} />
                  </Box>
                </>
              )}

              <Button
                component={RouterLink}
                to={`/reservations?property=${property.id}`}
                variant="outlined"
                sx={{ mt: 'auto' }}
              >
                View reservations
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </>
  );
}
