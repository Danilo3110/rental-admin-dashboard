import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import AppLayout from './components/layout/AppLayout.jsx';

// Each page is a separate chunk that loads on demand (code splitting).
const OverviewPage = lazy(() => import('./pages/OverviewPage.jsx'));
const ReservationsPage = lazy(() => import('./pages/ReservationsPage.jsx'));
const PropertiesPage = lazy(() => import('./pages/PropertiesPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

// On GitHub Pages the app lives under /rental-admin-dashboard/ (set with `vite build --base`).
const basename = import.meta.env.BASE_URL.replace(/\/+$/, '') || '/';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppLayout />,
      children: [
        { index: true, element: <OverviewPage /> },
        { path: 'reservations', element: <ReservationsPage /> },
        { path: 'properties', element: <PropertiesPage /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  { basename },
);
