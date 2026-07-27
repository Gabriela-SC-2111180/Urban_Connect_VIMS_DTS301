import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config — framework scaffold only.
// Dev server runs on 5173 (matches backend CORS_ORIGIN default in backend/.env.example).
// API base URL is injected at runtime via VITE_API_BASE_URL (see .env.example);
// no proxy is configured here on purpose — the typed API client reads the base URL.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
