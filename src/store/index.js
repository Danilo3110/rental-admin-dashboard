import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import reservationsReducer from './reservationsSlice.js';
import uiReducer, { THEME_STORAGE_KEY, toggleMode } from './uiSlice.js';

// Persist the light/dark choice to localStorage outside the reducer.
const listener = createListenerMiddleware();
listener.startListening({
  actionCreator: toggleMode,
  effect: (_, api) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, api.getState().ui.mode);
    } catch {
      // Storage is unavailable: the choice is not remembered, but the app works as usual.
    }
  },
});

export const store = configureStore({
  reducer: {
    reservations: reservationsReducer,
    ui: uiReducer,
  },
  middleware: (getDefault) => getDefault().prepend(listener.middleware),
});
