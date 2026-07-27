import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';

// Global design tokens + base styles (Area A7) — UrbanConnect visual language.
import './ui/theme.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found in index.html');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
