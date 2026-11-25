// Register only the Chart.js parts we use to keep the bundle small.
// Note: every <canvas> parent needs position: relative and a fixed height, otherwise
// Chart.js does not pick up width changes (e.g. when the sidebar opens or closes).
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';

Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
);
Chart.defaults.font.family = '"Inter Variable", system-ui, sans-serif';

/** Chart colors taken from the MUI theme so charts follow light/dark mode. */
export function useChartColors() {
  const theme = useTheme();
  // Stable object until the theme changes, so charts don't redraw on every render.
  return useMemo(() => {
    const dark = theme.palette.mode === 'dark';
    return {
      series: theme.palette.chart,
      text: theme.palette.text.secondary,
      grid: theme.palette.divider,
      surface: theme.palette.background.paper,
      tooltip: {
        backgroundColor: dark ? '#e8ede9' : '#16231c',
        titleColor: dark ? '#16231c' : '#ffffff',
        bodyColor: dark ? '#16231c' : '#ffffff',
        padding: 10,
        cornerRadius: 8,
        boxPadding: 4,
      },
    };
  }, [theme]);
}
