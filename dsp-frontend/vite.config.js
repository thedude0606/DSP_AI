import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3001,
    strictPort: true,
    allowedHosts: 'all',
    proxy: {
      '/advertising-api': {
        target: 'http://localhost:3000', // Point to our new Node.js proxy
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://localhost:3000', // Point to our new Node.js proxy
        changeOrigin: true,
        secure: false,
      },
    },
  },
})


