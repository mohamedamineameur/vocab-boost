import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // VitePWA désactivé temporairement pour éviter les problèmes de cache
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['vite.svg'],
    //   manifest: {
    //     name: 'English Learning App',
    //     short_name: 'LearnEng',
    //     description: 'Application d\'apprentissage de l\'anglais avec quiz et vocabulaire',
    //     theme_color: '#3B82F6',
    //     background_color: '#ffffff',
    //     display: 'standalone',
    //     orientation: 'portrait',
    //     scope: '/',
    //     start_url: '/',
    //     icons: [
    //       {
    //         src: '/vite.svg',
    //         sizes: '192x192',
    //         type: 'image/svg+xml',
    //         purpose: 'any maskable'
    //       },
    //       {
    //         src: '/vite.svg',
    //         sizes: '512x512',
    //         type: 'image/svg+xml',
    //         purpose: 'any maskable'
    //       }
    //     ]
    //   },
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/api\.*/i,
    //         handler: 'NetworkFirst',
    //         options: {
    //           cacheName: 'api-cache',
    //           expiration: {
    //             maxEntries: 50,
    //             maxAgeSeconds: 60 * 60 * 24 // 24 heures
    //           },
    //           cacheableResponse: {
    //             statuses: [0, 200]
    //           }
    //         }
    //       }
    //     ]
    //   }
    // })
  ],
  server: {
    host: "0.0.0.0", // ⚡ obligatoire pour être accessible depuis ton iPhone en LAN
    proxy: {
      "/api": {
        target: "http://192.168.2.19:5010", // ton backend
        changeOrigin: true,
      },
    },
  },
})
