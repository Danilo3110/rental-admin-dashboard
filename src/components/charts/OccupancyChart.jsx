import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { useChartColors } from './setup.js';

/** Horizontal bars: occupancy of each property in the current month (0–100%). */
export default function OccupancyChart({ items }) {
  const colors = useChartColors();
  const [color] = colors.series;

  const data = useMemo(
    () => ({
      labels: items.map((item) => item.property.name),
      datasets: [
        {
          label: 'Occupancy',
          data: items.map((item) => Math.round(item.month.occupancy * 100)),
          backgroundColor: alpha(color, 0.85),
          borderRadius: 6,
          barThickness: 22,
        },
      ],
    }),
    [items, color],
  );

  const options = useMemo(
    () => ({
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { ...colors.tooltip, callbacks: { label: (c) => ` Occupancy: ${c.parsed.x}%` } },
      },
      scales: {
        x: {
          min: 0,
          max: 100,
          grid: { color: colors.grid },
          border: { display: false },
          ticks: { color: colors.text, callback: (value) => `${value}%`, stepSize: 25 },
        },
        y: { grid: { display: false }, border: { display: false }, ticks: { color: colors.text } },
      },
    }),
    [colors],
  );

  return (
    <Box sx={{ position: 'relative', height: 240, minWidth: 0 }}>
      <Bar data={data} options={options} role="img" aria-label="Occupancy by property this month" />
    </Box>
  );
}
