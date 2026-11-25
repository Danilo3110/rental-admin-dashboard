import { createSlice, nanoid } from '@reduxjs/toolkit';

export const THEME_STORAGE_KEY = 'breza-admin:theme';

function initialMode() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // localStorage is unavailable; fall back to the system preference.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: () => ({ mode: initialMode(), toast: null, toastOpen: false }),
  reducers: {
    toggleMode(state) {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
    },
    showToast: {
      reducer(state, action) {
        state.toast = action.payload;
        state.toastOpen = true;
      },
      prepare(message, severity = 'success') {
        return { payload: { message, severity, key: nanoid() } };
      },
    },
    // Only clears `toastOpen`; the message stays visible during the exit animation.
    hideToast(state) {
      state.toastOpen = false;
    },
  },
});

export const { toggleMode, showToast, hideToast } = uiSlice.actions;
export default uiSlice.reducer;
