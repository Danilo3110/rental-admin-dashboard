// Memoized selectors: stats are recomputed only when reservations change.
import { createSelector } from '@reduxjs/toolkit';
import { PROPERTIES } from '../data/catalog.js';
import { addMonths, startOfDay, startOfMonth } from '../utils/dates.js';
import {
  channelBreakdown,
  monthSummary,
  monthlySeries,
  propertyMonthStats,
  upcomingCheckIns,
} from '../utils/stats.js';
import { selectAllReservations } from './reservationsSlice.js';

// "Today" is computed once at startup so memoization keeps working.
export const TODAY = startOfDay(new Date());
export const THIS_MONTH = startOfMonth(TODAY);

export const selectLoadStatus = (state) => state.reservations.status;
export const selectLoadError = (state) => state.reservations.error;

export const selectIsSaving = (state, id) => state.reservations.savingIds.includes(id);

export const selectKpis = createSelector([selectAllReservations], (list) => ({
  current: monthSummary(list, PROPERTIES.length, THIS_MONTH),
  previous: monthSummary(list, PROPERTIES.length, addMonths(THIS_MONTH, -1)),
}));

export const selectMonthlySeries = createSelector([selectAllReservations], (list) =>
  monthlySeries(list, PROPERTIES.length, TODAY),
);

export const selectChannelBreakdown = createSelector([selectAllReservations], (list) =>
  channelBreakdown(list, addMonths(THIS_MONTH, -11)),
);

export const selectPropertyStats = createSelector([selectAllReservations], (list) =>
  PROPERTIES.map((property) => ({
    property,
    month: propertyMonthStats(list, property, THIS_MONTH),
    upcoming: upcomingCheckIns(
      list.filter((r) => r.propertyId === property.id),
      TODAY,
      30,
    ).length,
  })),
);

export const selectUpcomingCheckIns = createSelector([selectAllReservations], (list) =>
  upcomingCheckIns(list, TODAY, 7),
);

export const selectPendingCount = createSelector(
  [selectAllReservations],
  (list) => list.filter((r) => r.status === 'pending').length,
);
