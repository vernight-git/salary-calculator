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
    globals: true,
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['node_modules', 'dist', 'e2e', '.idea', '.git', '.cache'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        'e2e/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        'vite.config.ts',
        'vitest.setup.ts',
        'playwright.config.ts',
        'dist/',
        '*.config.js',
        '*.config.ts',
        '*.config.mjs',
        'src/main.tsx', // Entry point - tested via E2E
        'src/App.tsx', // Main component - tested via E2E
        'src/utils/monitoring.ts', // Monitoring framework - integration code
        'src/types/**' // Type definitions - no runtime code
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  }
});
