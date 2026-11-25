import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { formatPercent } from '../../utils/format.js';
import { useChartColors } from './setup.js';

/** Doughnut with an HTML list as its legend, which is easier to read and more accessible. */
export default function ChannelChart({ channels }) {
  const colors = useChartColors();
  const total = channels.reduce((sum, channel) => sum + channel.count, 0);

  const data = useMemo(
    () => ({
      labels: channels.map((channel) => channel.label),
      datasets: [
        {
          data: channels.map((channel) => channel.count),
          backgroundColor: colors.series,
          borderColor: colors.surface,
          borderWidth: 3,
          hoverOffset: 6,
        },
      ],
    }),
    [channels, colors.series, colors.surface],
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: { legend: { display: false }, tooltip: colors.tooltip },
    }),
    [colors.tooltip],
  );

  return (
    <Box>
      <Box sx={{ position: 'relative', height: 190, minWidth: 0 }}>
        <Doughnut data={data} options={options} role="img" aria-label="Bookings by channel" />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeContent: 'center',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography variant="h5" component="p">
            {total}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            bookings
          </Typography>
        </Box>
      </Box>

      <Box component="ul" sx={{ listStyle: 'none', m: 0, mt: 2, p: 0, display: 'grid', gap: 1 }}>
        {channels.map((channel, index) => (
          <Box
            component="li"
            key={channel.id}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.25, fontSize: '0.9rem' }}
          >
            <Box
              aria-hidden="true"
              sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: colors.series[index] }}
            />
            <Box component="span" sx={{ flex: 1 }}>
              {channel.label}
            </Box>
            <Box component="span" sx={{ fontWeight: 600 }}>
              {channel.count}
            </Box>
            <Box component="span" sx={{ width: 44, textAlign: 'right', color: 'text.secondary' }}>
              {total ? formatPercent(channel.count / total) : '–'}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
