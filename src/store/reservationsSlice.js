import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import * as api from '../api/fakeApi.js';

const adapter = createEntityAdapter();

export const fetchReservations = createAsyncThunk(
  'reservations/fetchAll',
  () => api.fetchReservations(),
  {
    // Skip the request while one is in flight or the data is already loaded
    // (React StrictMode runs effects twice in development).
    condition: (_, { getState }) => {
      const { status } = getState().reservations;
      return status !== 'loading' && status !== 'succeeded';
    },
  },
);

export const changeReservationStatus = createAsyncThunk(
  'reservations/changeStatus',
  ({ id, status }) => api.updateReservationStatus(id, status),
);

export const addReservation = createAsyncThunk('reservations/add', (input) =>
  api.createReservation(input),
);

const reservationsSlice = createSlice({
  name: 'reservations',
  initialState: adapter.getInitialState({ status: 'idle', error: null, savingIds: [] }),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReservations.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        adapter.setAll(state, action.payload);
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Something went wrong.';
      })
      .addCase(changeReservationStatus.pending, (state, action) => {
        state.savingIds.push(action.meta.arg.id);
      })
      .addCase(changeReservationStatus.fulfilled, (state, action) => {
        adapter.upsertOne(state, action.payload);
        state.savingIds = state.savingIds.filter((id) => id !== action.payload.id);
      })
      .addCase(changeReservationStatus.rejected, (state, action) => {
        state.savingIds = state.savingIds.filter((id) => id !== action.meta.arg.id);
      })
      .addCase(addReservation.fulfilled, (state, action) => {
        adapter.addOne(state, action.payload);
      });
  },
});

export const { selectAll: selectAllReservations, selectById: selectReservationById } =
  adapter.getSelectors((state) => state.reservations);

export default reservationsSlice.reducer;
