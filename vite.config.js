import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Large libraries get their own chunks so they are cached separately from app code.
        manualChunks(id) {
          if (id.includes('node_modules/chart.js') || id.includes('node_modules/react-chartjs-2'))
            return 'charts';
          if (id.includes('node_modules/@mui') || id.includes('node_modules/@emotion'))
            return 'mui';
          return undefined;
        },
      },
    },
  },
});
