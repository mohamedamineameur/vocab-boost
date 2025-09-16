import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
