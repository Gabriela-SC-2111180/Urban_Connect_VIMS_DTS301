import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Vitest config — a single smoke test only at this stage.
// Real test suites are owned by the feature/foundation kanban cards (A8 etc.).
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
