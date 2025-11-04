import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MonitoringService } from './services/monitoring.service';
import { SecurityUtils } from './utils/security';
import { registerServiceWorker } from './utils/pwaUtils';
import App from './App.tsx';
import './index.css';
import './i18n';

// Initialize monitoring (Sentry DSN should be in env)
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
if (SENTRY_DSN) {
  MonitoringService.init(SENTRY_DSN);
}

// Set security headers
SecurityUtils.setSecurityHeaders();

// Register service worker for PWA
registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
