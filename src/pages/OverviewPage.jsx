import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddRounded from '@mui/icons-material/AddRounded';
import EuroRounded from '@mui/icons-material/EuroRounded';
import EventAvailableRounded from '@mui/icons-material/EventAvailableRounded';
import HotelRounded from '@mui/icons-material/HotelRounded';
import NightsStayRounded from '@mui/icons-material/NightsStayRounded';
import ChartCard from '../components/ChartCard.jsx';
import ChannelChart from '../components/charts/ChannelChart.jsx';
import OccupancyChart from '../components/charts/OccupancyChart.jsx';
import RevenueChart from '../components/charts/RevenueChart.jsx';
import ErrorState from '../components/ErrorState.jsx';
import KpiCard from '../components/KpiCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import UpcomingCheckIns from '../components/UpcomingCheckIns.jsx';
import {
  selectChannelBreakdown,
  selectKpis,
  selectLoadStatus,
  selectMonthlySeries,
  selectPropertyStats,
  selectUpcomingCheckIns,
  THIS_MONTH,
} from '../store/selectors.js';
import { formatCurrency, formatMonthLong, formatPercent } from '../utils/format.js';
import { percentChange } from '../utils/stats.js';

export default function OverviewPage() {
  const status = useSelector(selectLoadStatus);
  const { current, previous } = useSelector(selectKpis);
  const series = useSelector(selectMonthlySeries);
  const channels = useSelector(selectChannelBreakdown);
  const propertyStats = useSelector(selectPropertyStats);
  const upcoming = useSelector(selectUpcomingCheckIns);

  const loading = status !== 'succeeded';
  const month = formatMonthLong(THIS_MONTH);

  const header = (
    <PageHeader
      title="Overview"
      subtitle={`${month} · all properties`}
      actions={
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          component={RouterLink}
          to="/reservations?new=1"
        >
          New reservation
        </Button>
      }
    />
  );

  // Without data there is nothing to show except the error and a retry button.
  if (status === 'failed') {
    return (
      <>
        {header}
        <ErrorState />
      </>
    );
  }

  return (
    <>
      {header}

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          // Four cards per row only when each gets at least ~250px next to the sidebar.
          '@media (min-width: 1360px)': { gridTemplateColumns: 'repeat(4, 1fr)' },
        }}
      >
        <KpiCard
          label="Revenue this month"
          value={formatCurrency(current.revenue)}
          change={percentChange(current.revenue, previous.revenue)}
          icon={<EuroRounded fontSize="small" />}
          loading={loading}
        />
        <KpiCard
          label="Occupancy"
          value={formatPercent(current.occupancy)}
          change={percentChange(current.occupancy, previous.occupancy)}
          icon={<HotelRounded fontSize="small" />}
          loading={loading}
        />
        <KpiCard
          label="Check-ins"
          value={current.checkIns}
          change={percentChange(current.checkIns, previous.checkIns)}
          icon={<EventAvailableRounded fontSize="small" />}
          loading={loading}
        />
        <KpiCard
          label="Average nightly rate"
          value={formatCurrency(current.averageRate)}
          change={percentChange(current.averageRate, previous.averageRate)}
          icon={<NightsStayRounded fontSize="small" />}
          loading={loading}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          mt: 2,
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 2fr) minmax(0, 1fr)' },
        }}
      >
        <ChartCard title="Revenue & check-ins" subtitle="Last 12 months" loading={loading}>
          <RevenueChart series={series} />
        </ChartCard>
        <ChartCard title="Booking channels" subtitle="Last 12 months" loading={loading}>
          <ChannelChart channels={channels} />
        </ChartCard>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          mt: 2,
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        <ChartCard title="Occupancy by property" subtitle={month} loading={loading} height={240}>
          <OccupancyChart items={propertyStats} />
        </ChartCard>
        <UpcomingCheckIns items={upcoming} loading={loading} />
      </Box>
    </>
  );
}
