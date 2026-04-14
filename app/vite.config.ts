import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'src'),
  base: '/',
  plugins: [
    VitePWA({
      injectRegister: 'auto',
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      workbox: {
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'static-resources' }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: { cacheName: 'images', expiration: { maxEntries: 50 } }
          }
        ]
      },
      manifest: {
        name: 'Dice Baseball',
        short_name: 'DiceBB',
        description: 'A small baseball dice game',
        start_url: '/',
        display: 'standalone',
        background_color: '#222222',
        theme_color: '#222222',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});
