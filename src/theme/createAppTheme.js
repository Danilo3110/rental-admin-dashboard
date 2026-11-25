import { createTheme } from '@mui/material/styles';

// Status and chart colors are tuned separately for light and dark mode to keep text contrast high.
const TOKENS = {
  light: {
    primary: '#2f6b4f',
    secondary: '#b7712f',
    background: '#f4f5f2',
    paper: '#ffffff',
    text: '#16231c',
    textSecondary: '#5b6a62',
    divider: 'rgba(20, 35, 28, 0.1)',
    success: '#2e7d4f',
    warning: '#a85d00',
    error: '#b3392b',
    info: '#3d6f9e',
    chart: ['#2f6b4f', '#c98a45', '#4f7cac', '#8a6fb0'],
    status: {
      confirmed: { color: '#1f6b43', bg: '#e3f2e9' },
      pending: { color: '#8a5300', bg: '#fbefd9' },
      completed: { color: '#44525b', bg: '#e9eef1' },
      cancelled: { color: '#a33a2c', bg: '#f9e3df' },
    },
  },
  dark: {
    primary: '#6fb592',
    secondary: '#e0a868',
    background: '#0e1411',
    paper: '#151d19',
    text: '#e8ede9',
    textSecondary: '#9aa8a0',
    divider: 'rgba(255, 255, 255, 0.09)',
    success: '#7fd3a3',
    warning: '#f2c072',
    error: '#f19a8c',
    info: '#8fb8e0',
    chart: ['#6fb592', '#e0a868', '#7fa7d6', '#b39ddb'],
    status: {
      confirmed: { color: '#7fd3a3', bg: 'rgba(127, 211, 163, 0.14)' },
      pending: { color: '#f2c072', bg: 'rgba(242, 192, 114, 0.14)' },
      completed: { color: '#b4c0c8', bg: 'rgba(180, 192, 200, 0.12)' },
      cancelled: { color: '#f19a8c', bg: 'rgba(241, 154, 140, 0.14)' },
    },
  },
};

export function createAppTheme(mode) {
  const t = TOKENS[mode];
  return createTheme({
    palette: {
      mode,
      primary: { main: t.primary },
      secondary: { main: t.secondary },
      success: { main: t.success },
      warning: { main: t.warning },
      error: { main: t.error },
      info: { main: t.info },
      background: { default: t.background, paper: t.paper },
      text: { primary: t.text, secondary: t.textSecondary },
      divider: t.divider,
      chart: t.chart,
      status: t.status,
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: '"Inter Variable", system-ui, -apple-system, "Segoe UI", sans-serif',
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 700, letterSpacing: '-0.01em' },
      h6: { fontWeight: 650, fontSize: '1.05rem' },
      subtitle2: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
      overline: { fontWeight: 700, letterSpacing: '0.08em' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: { body: { WebkitFontSmoothing: 'antialiased' } },
      },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiCard: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: { root: { borderRadius: 16 } },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: 10 } },
      },
      MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
      MuiAppBar: { defaultProps: { elevation: 0, color: 'inherit' } },
      MuiTableCell: {
        styleOverrides: {
          head: ({ theme }) => ({
            color: theme.palette.text.secondary,
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }),
        },
      },
      MuiTooltip: { defaultProps: { arrow: true } },
    },
  });
}
