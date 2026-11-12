import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [],
        includeManifestIcons: false,
        manifest: {
          id: '/',
          name: 'Nectarline — Supply Side Studio',
          short_name: 'Nectarline',
          description: 'The leading independent self-serve studio for curating programmatic supply.',
          theme_color: '#0d0830',
          background_color: '#0d0830',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 25 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,mp4,glb,woff,woff2}'],
          globIgnores: ['**/aistudio/**'],
          navigateFallback: '/index.html',
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: /\/assets\/.*\.mp4$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'nectarline-video-cache',
                rangeRequests: true,
                matchOptions: {
                  ignoreVary: true,
                },
                cacheableResponse: {
                  statuses: [0, 200, 206],
                },
              },
            },
            {
              urlPattern: /\/(assets|fonts)\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'nectarline-media-cache',
                matchOptions: {
                  ignoreVary: true,
                },
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: ({ sameOrigin, url }) =>
                sameOrigin && !url.pathname.includes('dev-sw.js') && !url.pathname.endsWith('/sw.js'),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'nectarline-app-shell',
                networkTimeoutSeconds: 3,
                matchOptions: {
                  ignoreVary: true,
                },
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'classic',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
