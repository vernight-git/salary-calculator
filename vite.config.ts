import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    globals: true
  }
});
