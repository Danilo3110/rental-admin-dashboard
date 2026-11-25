import { Suspense, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, ScrollRestoration } from 'react-router';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Snackbar from '@mui/material/Snackbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { fetchReservations } from '../../store/reservationsSlice.js';
import { hideToast } from '../../store/uiSlice.js';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';

const SIDEBAR_WIDTH = 252;

function Toast() {
  const dispatch = useDispatch();
  const toast = useSelector((state) => state.ui.toast);
  const open = useSelector((state) => state.ui.toastOpen);
  const close = (_, reason) => reason !== 'clickaway' && dispatch(hideToast());

  return (
    <Snackbar
      key={toast?.key}
      open={open}
      autoHideDuration={4000}
      onClose={close}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity={toast?.severity ?? 'success'} variant="filled" onClose={close}>
        {toast?.message}
      </Alert>
    </Snackbar>
  );
}

export default function AppLayout() {
  const dispatch = useDispatch();
  // noSsr: correct value on the first render, so the sidebar doesn't jump on load.
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('lg'), { noSsr: true });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchReservations());
  }, [dispatch]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        width={SIDEBAR_WIDTH}
        permanent={isDesktop}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <TopBar showMenuButton={!isDesktop} onMenuClick={() => setMenuOpen(true)} />
        <Box
          component="main"
          sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 2.5, sm: 3.5 } }}
        >
          <Suspense fallback={<LinearProgress aria-label="Loading page" />}>
            <Outlet />
          </Suspense>
        </Box>
      </Box>
      <Toast />
      {/* New pages start at the top and "back" restores the previous position. Filters (?status=)
          only change the query string, so positions are keyed by pathname, not the full URL. */}
      <ScrollRestoration getKey={(location) => location.pathname} />
    </Box>
  );
}
