import React from 'react';
import { createRoot } from 'react-dom/client';
import { MonitoringService } from './services/monitoring.service';
import { SecurityUtils } from './utils/security';
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

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA after React has mounted
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => console.log('Service Worker registered:', registration))
      .catch(error => console.error('Service Worker registration failed:', error));
  });
}
