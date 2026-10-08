import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for PWA installation & offline caching.
// Skipped inside the native Capacitor shell (custom scheme): the SW from
// public/sw.js cannot run there and would only log errors.
const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.();
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production' && !isCapacitor) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('PWA Service Worker registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('PWA Service Worker registration failed:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

