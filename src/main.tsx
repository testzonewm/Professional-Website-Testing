import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

async function warmOfflineCache() {
  if (!('caches' in window) || !navigator.serviceWorker?.controller) return;
  const urls = new Set<string>(['/']);
  for (const entry of performance.getEntriesByType('resource')) {
    try {
      const u = new URL(entry.name, window.location.origin);
      if (
        u.origin === window.location.origin &&
        !u.pathname.includes('dev-sw.js') &&
        !u.pathname.endsWith('/sw.js')
      ) {
        urls.add(u.pathname + u.search);
      }
    } catch {
      // ignore invalid resource URLs
    }
  }
  for (const url of urls) {
    const cached = await caches.match(url, { ignoreVary: true });
    if (!cached) {
      await fetch(url, { cache: 'no-cache' }).catch(() => {});
    }
  }
  document.documentElement.setAttribute('data-offline-ready', 'true');
}

if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onOfflineReady() {
      document.documentElement.setAttribute('data-offline-ready', 'true');
    },
  });

  const scheduleWarm = () => {
    window.setTimeout(() => {
      warmOfflineCache();
    }, 400);
    window.setTimeout(() => {
      warmOfflineCache();
    }, 2600);
  };

  navigator.serviceWorker.ready.then(() => {
    if (navigator.serviceWorker.controller) {
      scheduleWarm();
    } else {
      navigator.serviceWorker.addEventListener('controllerchange', scheduleWarm, { once: true });
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
