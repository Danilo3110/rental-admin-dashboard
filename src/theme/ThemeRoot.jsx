import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { createAppTheme } from './createAppTheme.js';

/** The theme follows `ui.mode` in Redux, so switching it needs no reload. */
export default function ThemeRoot({ children }) {
  const mode = useSelector((state) => state.ui.mode);
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme.palette.background.default);
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}
