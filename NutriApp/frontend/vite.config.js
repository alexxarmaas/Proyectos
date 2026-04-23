import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'NutriApp',
        short_name: 'NutriApp',
        display: 'standalone',
        theme_color: '#215f46',
        icons: [
          { src: '/pwa-192.svg', sizes: '192x192', purpose: 'any maskable' },
          { src: '/pwa-512.svg', sizes: '512x512', purpose: 'any maskable' }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              networkTimeoutSeconds: 8,
              cacheName: 'nutriapp-api-cache',
              expiration: { maxAgeSeconds: 43200 }
            }
          }
        ]
      }
    })
  ]
});
