import { useMemo } from 'react';
import { Chart } from 'react-chartjs-2';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { formatCompactCurrency, formatCurrency, formatMonthShort } from '../../utils/format.js';
import { useChartColors } from './setup.js';

/** Combo chart: revenue as bars (left axis) and check-ins as a line (right axis). */
export default function RevenueChart({ series }) {
  const colors = useChartColors();
  const [revenueColor, checkInColor] = colors.series;

  const data = useMemo(
    () => ({
      labels: series.map((point) => formatMonthShort(point.month)),
      datasets: [
        {
          type: 'bar',
          label: 'Revenue',
          data: series.map((point) => point.revenue),
          backgroundColor: series.map((_, index) =>
            alpha(revenueColor, index === series.length - 1 ? 1 : 0.75),
          ),
          borderRadius: 6,
          maxBarThickness: 32,
          yAxisID: 'revenue',
          order: 2,
        },
        {
          type: 'line',
          label: 'Check-ins',
          data: series.map((point) => point.checkIns),
          borderColor: checkInColor,
          backgroundColor: checkInColor,
          pointBackgroundColor: colors.surface,
          pointBorderWidth: 2,
          pointRadius: 3.5,
          tension: 0.35,
          yAxisID: 'checkIns',
          order: 1,
        },
      ],
    }),
    [series, revenueColor, checkInColor, colors.surface],
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: colors.text, usePointStyle: true, boxWidth: 8, padding: 16 },
        },
        tooltip: {
          ...colors.tooltip,
          callbacks: {
            label: (context) =>
              context.dataset.yAxisID === 'revenue'
                ? ` Revenue: ${formatCurrency(context.parsed.y)}`
                : ` Check-ins: ${context.parsed.y}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { color: colors.text } },
        revenue: {
          position: 'left',
          beginAtZero: true,
          grid: { color: colors.grid },
          border: { display: false },
          ticks: { color: colors.text, callback: (value) => formatCompactCurrency(value) },
        },
        checkIns: {
          position: 'right',
          beginAtZero: true,
          grid: { display: false },
          border: { display: false },
          ticks: { color: colors.text, precision: 0 },
        },
      },
    }),
    [colors],
  );

  const total = series.reduce((sum, point) => sum + point.revenue, 0);

  return (
    <Box sx={{ position: 'relative', height: 300, minWidth: 0 }}>
      <Chart
        type="bar"
        data={data}
        options={options}
        role="img"
        aria-label={`Revenue and check-ins for the last 12 months. Total revenue ${formatCurrency(total)}.`}
      />
    </Box>
  );
}
